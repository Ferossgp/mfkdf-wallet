import mfkdf from 'mfkdf'
import {
  generatePrivateKey,
  privateKeyToAccount
} from 'viem/accounts'

async function sha256(string: string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export type Policies = {
  password: string,
  uuid?: string
}

export type Store = {
  policy: any,
  hint: string,
  cs: string,
  address: string,
  key: string
}

export async function createNewWallet(policies: Policies) {
  const setup = await mfkdf.policy.setup(await mfkdf.policy.atLeast(2, [
    await mfkdf.setup.factors.password(policies.password),
    await mfkdf.setup.factors.uuid({ uuid: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' })
  ]))

  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)

  const store: Store = {
    policy: setup.policy,
    hint: (await sha256(policies.password)).slice(-2),
    cs: await sha256(setup.key.toString("hex")),
    address: account.address,
    key: (await setup.encrypt(privateKey, "aes256")).toString("hex"),
  }

  return {
    store,
    privateKey
  }
}

export async function deriveWallet(store: Store, policies: Policies) {
  const derived = await mfkdf.policy.derive(store.policy, {
    password: mfkdf.derive.factors.password(policies.password),
    uuid: mfkdf.derive.factors.uuid('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'),
  });

  const cs = await sha256(derived.key.toString("hex"));

  if (cs !== store.cs) {
    throw new Error("Invalid checksum")
  }

  const key = await derived.decrypt(Buffer.from(store.key, "hex"), "aes256");

  return key.toString()
}