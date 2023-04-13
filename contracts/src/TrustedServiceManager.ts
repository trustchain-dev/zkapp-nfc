import { Field, PublicKey, Poseidon, Struct } from 'snarkyjs';

export class TrustedServiceManager extends Struct({
  id: Field,
  publicKey: PublicKey,
  domainName: Field,
}) {
  static from(id: Field, publicKey: PublicKey, domainName: Field) {
    return new TrustedServiceManager({
      id: id,
      publicKey: publicKey,
      domainName: domainName,
    });
  }

  static empty() {
    return TrustedServiceManager.from(Field(0), PublicKey.empty(), Field(0));
  }

  hash(): Field {
    return Poseidon.hash(
      this.publicKey
        .toFields()
        .concat(this.id.toFields())
        .concat(this.domainName.toFields())
    );
  }
}
