## WeiDY2
Clone the repository.
```git
git clone  https://github.com/VHLRegov/regovPQ.git
```
change into 'WeiDY Solution' folder.
```bash
cd weidy2
```


### Install Dependencies

```bash
yarn install
```

then build,
```bash
yarn build
```

### Docker

Make sure you have Docker installed in your system (Ubuntu).
Now Run:
```docker
docker compose up
```
#### This will run the application and logs will be  displayed. <br />
1. getGenesisTransaction: Retrieves the genesis transaction for a particular Indy network.<br /><br />
2. initializeHolderAgent: Initializes the holder agent by creating a new instance of an agent with a configuration that includes the wallet,       logger, the Indy ledger, and endpoint information. The function also registers inbound and outbound transports for the agent and initializes it.<br /><br />
3. initializeIssuerAgent: Initializes the issuer agent in a similar manner to initializeHolderAgent.<br /><br />
4. registerSchema: Registers a schema on the Indy ledger.<br /><br />
5. registerCredentialDefinition: Registers a credential definition on the Indy ledger.<br /><br />
6. setupCredentialListener: Sets up a listener for credential state changes on the holder agent. When a credential offer is received, the function accepts the offer       and exits the program.<br /><br />
7. issueCredential: Offers a credential to the holder agent.<br /><br />
8. createNewInvitation: Creates an out-of-band invitation using the issuer agent.<br /><br />
9. receiveInvitation: Receives an out-of-band invitation and accepts it using the holder agent.<br /><br />

