import { Field, PublicKey, Poseidon, Struct } from 'snarkyjs';

export class NFC extends Struct({
  publicKey: PublicKey,
  serialNumber: Field,
  tagId: Field,
  scanCounter: Field,
}) {
  static from(
    publicKey: PublicKey,
    serialNumber: Field,
    tagId: Field,
    scanCounter: Field
  ) {
    return new NFC({
      publicKey: publicKey,
      serialNumber: serialNumber,
      tagId: tagId,
      scanCounter: scanCounter,
    });
  }

  static empty() {
    return NFC.from(PublicKey.empty(), Field(0), Field(0), Field(0));
  }

  hash(): Field {
    return Poseidon.hash(
      this.publicKey
        .toFields()
        .concat(this.serialNumber.toFields())
        .concat(this.tagId.toFields())
        .concat(this.scanCounter.toFields())
    );
  }
}
