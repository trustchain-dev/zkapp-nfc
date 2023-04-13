import {
  Bool,
  Field,
  Mina,
  method,
  provablePure,
  ProvablePure,
  PublicKey,
  state,
  State,
  SmartContract,
  UInt64,
} from 'snarkyjs';

export { MinaCash, IMinaCash };

type IMinaCash = {
  updatecommittedNfcRoot(newcommittedNfcRoot: Field): Bool; // emits "RootUpdated" event
  updateTrustedServiceManager(newTrustedServiceManager: PublicKey): Bool;
  withdraw(to: PublicKey, amount: UInt64): Bool; // emits "Withdraw" event
  // events
  events: {
    RootUpdated: ProvablePure<{
      oldRoot: Field;
      newRoot: Field;
    }>;
    Withdraw: ProvablePure<{
      from: PublicKey;
      to: PublicKey;
      amount: UInt64;
    }>;
  };
};

/**
 * @notice MinaCash is a smart NFC contract that holds MINA within NFC tags.
 */
class MinaCash extends SmartContract implements IMinaCash {
  // root of the NFC Merkle Tree
  @state(Field) committedNfcRoot = State<Field>();
  // root of the Trusted Service Manager Merkle Tree
  @state(Field) committedTrustedServiceManagerRoot = State<Field>();
  // public key of the Trusted Service Manager
  @state(PublicKey) trustedServiceManager = State<PublicKey>();

  events = {
    RootUpdated: provablePure({
      oldRoot: Field,
      newRoot: Field,
    }),
    Withdraw: provablePure({
      from: PublicKey,
      to: PublicKey,
      amount: UInt64,
    }),
  };

  init() {
    super.init();
    this.committedNfcRoot.set(Field(0));
    this.committedTrustedServiceManagerRoot.set(Field(0));
    this.trustedServiceManager.set(PublicKey.empty());
  }

  /**
   * @notice Updates the NFC Merkle Tree root
   * @param newcommittedNfcRoot The new NFC Merkle Tree root
   * @returns true if the NFC Merkle Tree root was successfully updated
   * requirements:
   * - The new NFC Merkle Tree root must be greater than 0
   * - This method can only be called by the Trusted Service Manager
   */

  @method updatecommittedNfcRoot(newcommittedNfcRoot: Field): Bool {
    newcommittedNfcRoot.assertGreaterThan(Field(0));

    const currentState = this.committedNfcRoot.get();
    this.committedNfcRoot.assertEquals(currentState);

    const trustedServiceManager = this.trustedServiceManager.get();
    this.trustedServiceManager.assertEquals(trustedServiceManager);

    const sender = this.sender;
    sender.assertEquals(trustedServiceManager);

    this.committedNfcRoot.set(newcommittedNfcRoot);
    this.emitEvent('RootUpdated', {
      oldRoot: currentState,
      newRoot: newcommittedNfcRoot,
    });
    return Bool(true);
  }

  /**
   * @notice Updates the Trusted Service Manager
   * @param newTrustedServiceManager
   * @returns true if the Trusted Service Manager was successfully updated
   * requirements:
   * - This method can only be called by the Trusted Service Manager
   */
  @method updateTrustedServiceManager(
    newTrustedServiceManager: PublicKey
  ): Bool {
    const trustedServiceManager = this.trustedServiceManager.get();
    this.trustedServiceManager.assertEquals(trustedServiceManager);

    const committedTrustedServiceManagerRoot =
      this.committedTrustedServiceManagerRoot.get();
    this.committedTrustedServiceManagerRoot.assertEquals(
      committedTrustedServiceManagerRoot
    );

    const sender = this.sender;
    sender.assertEquals(trustedServiceManager);

    this.trustedServiceManager.set(newTrustedServiceManager);
    return Bool(true);
  }

  /**
   * @notice Withdraws funds from the contract to the given address
   * @param to The address to send the funds to
   * @param amount The amount of funds to send
   * @return true if the funds were successfully sent
   * requirements:
   *  - The amount must be greater than 0
   *  - This method can only be called by the Trusted Service Manager
   *  - This method can only be called if the sender has enough funds
   *  - This method emits a "Withdraw" event
   */
  @method withdraw(to: PublicKey, amount: UInt64): Bool {
    amount.assertGreaterThan(UInt64.from(0));
    const sender = this.sender;

    const trustedServiceManager = this.trustedServiceManager.get();
    trustedServiceManager.assertEquals(sender);
    sender.assertEquals(trustedServiceManager);

    const senderBalance = Mina.getBalance(sender);
    senderBalance.assertGreaterThanOrEqual(amount);

    this.send({ to: to, amount });

    this.emitEvent('Withdraw', {
      from: this.address,
      to: to,
      amount: amount,
    });
    return Bool(true);
  }
}
