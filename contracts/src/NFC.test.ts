import { Field, PublicKey, Poseidon, isReady, PrivateKey } from 'snarkyjs';
import { NFC } from './NFC';

describe('NFC', () => {
  beforeAll(async () => {
    await isReady;
  });
  describe('#NFC().from', () => {
    it('create a new NFC', async () => {
      const privateKey = PrivateKey.random();
      const publicKey = privateKey.toPublicKey();
      const serialNumber = Field.random();
      const tagId = Field.random();
      const scanCounter = Field.random();
      const nfc = NFC.from(publicKey, serialNumber, tagId, scanCounter);
      expect(nfc.publicKey).toEqual(publicKey);
      expect(nfc.serialNumber).toEqual(serialNumber);
      expect(nfc.tagId).toEqual(tagId);
      expect(nfc.scanCounter).toEqual(scanCounter);
    });
  });

  describe('#empty', () => {
    it('create an empty NFC', async () => {
      const nfc = NFC.empty();
      expect(nfc.publicKey).toEqual(PublicKey.empty());
      expect(nfc.serialNumber).toEqual(Field(0));
      expect(nfc.tagId).toEqual(Field(0));
      expect(nfc.scanCounter).toEqual(Field(0));
    });
  });

  describe('#hash()', () => {
    it('should return hash of the NFC', async () => {
      const privateKey = PrivateKey.random();
      const publicKey = privateKey.toPublicKey();
      const serialNumber = Field.random();
      const tagId = Field.random();
      const scanCounter = Field.random();
      const nfc = NFC.from(publicKey, serialNumber, tagId, scanCounter);
      const hash = Poseidon.hash(
        nfc.publicKey
          .toFields()
          .concat(nfc.serialNumber.toFields())
          .concat(nfc.tagId.toFields())
          .concat(nfc.scanCounter.toFields())
      );
      expect(nfc.hash()).toEqual(hash);
    });
  });
});
