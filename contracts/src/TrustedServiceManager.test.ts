import { Field, PublicKey, Poseidon, isReady, PrivateKey } from 'snarkyjs';
import { TrustedServiceManager } from './TrustedServiceManager';

describe('TrustedServiceManager', () => {
  beforeAll(async () => {
    await isReady;
  });
  describe('#TrustedServiceManager().from', () => {
    it('create a new TrustedServiceManager', async () => {
      const privateKey = PrivateKey.random();
      const publicKey = privateKey.toPublicKey();
      const id = Field.random();
      const domainName = Field.random();
      const trustedServiceManager = TrustedServiceManager.from(
        id,
        publicKey,
        domainName
      );
      expect(trustedServiceManager.publicKey).toEqual(publicKey);
      expect(trustedServiceManager.id).toEqual(id);
      expect(trustedServiceManager.domainName).toEqual(domainName);
    });
  });

  describe('#empty', () => {
    it('create an empty TrustedServiceManager', async () => {
      const trustedServiceManager = TrustedServiceManager.empty();
      expect(trustedServiceManager.publicKey).toEqual(PublicKey.empty());
      expect(trustedServiceManager.id).toEqual(Field(0));
      expect(trustedServiceManager.domainName).toEqual(Field(0));
    });
  });

  describe('#hash()', () => {
    it('should return hash of the NFC', async () => {
      const privateKey = PrivateKey.random();
      const publicKey = privateKey.toPublicKey();
      const id = Field.random();
      const domainName = Field.random();
      const trustedServiceManager = TrustedServiceManager.from(
        id,
        publicKey,
        domainName
      );
      const hash = Poseidon.hash(
        trustedServiceManager.publicKey
          .toFields()
          .concat(trustedServiceManager.id.toFields())
          .concat(trustedServiceManager.domainName.toFields())
      );
      expect(trustedServiceManager.hash()).toEqual(hash);
    });
  });
});
