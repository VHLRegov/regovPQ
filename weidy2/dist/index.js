"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aries-framework/core");
const node_1 = require("@aries-framework/node");
const node_fetch_1 = __importDefault(require("node-fetch"));
const logger_1 = require("./utils/logger");
const logger = new logger_1.TestLogger(core_1.LogLevel.debug);
const getGenesisTransaction = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, node_fetch_1.default)(url);
    return yield response.text();
});
const initializeHolderAgent = () => __awaiter(void 0, void 0, void 0, function* () {
    const genesisTransactionsBCovrinTestNet = yield getGenesisTransaction('http://test.bcovrin.vonx.io/genesis');
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label. It also sets the mediator invitation url,
    // because this is most likely required in a mobile environment.
    const config = {
        label: 'myBid-agent-holder',
        walletConfig: {
            id: 'myBid-agent-holder',
            key: 'myBid123',
        },
        indyLedgers: [
            {
                id: 'myBid-Regov',
                isProduction: false,
                genesisTransactions: genesisTransactionsBCovrinTestNet,
            },
        ],
        logger: logger,
        autoAcceptCredentials: core_1.AutoAcceptCredential.ContentApproved,
        autoAcceptConnections: true,
        endpoints: ['http://localhost:3002'],
    };
    // A new instance of an agent is created here
    const agent = new core_1.Agent(config, node_1.agentDependencies);
    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new core_1.WsOutboundTransport());
    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new core_1.HttpOutboundTransport());
    // Register a simple `Http` inbound transport
    agent.registerInboundTransport(new node_1.HttpInboundTransport({ port: 3002 }));
    // Initialize the agent
    yield agent.initialize();
    return agent;
});
const initializeIssuerAgent = () => __awaiter(void 0, void 0, void 0, function* () {
    const genesisTransactionsBCovrinTestNet = yield getGenesisTransaction('http://test.bcovrin.vonx.io/genesis');
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label.
    const config = {
        label: 'myBid-agent-issuer',
        walletConfig: {
            id: 'myBid-agent-issuer',
            key: 'myBid123',
        },
        publicDidSeed: 'qPa9E2iIwV2Sh37aqEj3LS3oLjZhiu5B',
        indyLedgers: [
            {
                id: 'myBid-Regov',
                isProduction: false,
                genesisTransactions: genesisTransactionsBCovrinTestNet,
            },
        ],
        logger: logger,
        autoAcceptCredentials: core_1.AutoAcceptCredential.ContentApproved,
        autoAcceptConnections: true,
        endpoints: ['http://localhost:3001'],
    };
    // A new instance of an agent is created here
    const agent = new core_1.Agent(config, node_1.agentDependencies);
    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new core_1.WsOutboundTransport());
    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new core_1.HttpOutboundTransport());
    // Register a simple `Http` inbound transport
    agent.registerInboundTransport(new node_1.HttpInboundTransport({ port: 3001 }));
    // Initialize the agent
    yield agent.initialize();
    return agent;
});
const registerSchema = (issuer) => __awaiter(void 0, void 0, void 0, function* () { return issuer.ledger.registerSchema({ attributes: ['name', 'age'], name: 'Identity25', version: '25.0' }); });
const registerCredentialDefinition = (issuer, schema) => __awaiter(void 0, void 0, void 0, function* () { return issuer.ledger.registerCredentialDefinition({ schema, supportRevocation: false, tag: 'default' }); });
const setupCredentialListener = (holder) => {
    holder.events.on(core_1.CredentialEventTypes.CredentialStateChanged, ({ payload }) => __awaiter(void 0, void 0, void 0, function* () {
        switch (payload.credentialRecord.state) {
            case core_1.CredentialState.OfferReceived:
                console.log('received a credential');
                // custom logic here
                yield holder.credentials.acceptOffer({ credentialRecordId: payload.credentialRecord.id });
            case core_1.CredentialState.Done:
                console.log(`Credential for credential id ${payload.credentialRecord.id} is accepted`);
                // For demo purposes we exit the program here.
                process.exit(0);
        }
    }));
};
const issueCredential = (issuer, credentialDefinitionId, connectionId) => __awaiter(void 0, void 0, void 0, function* () {
    return issuer.credentials.offerCredential({
        protocolVersion: 'v1',
        connectionId,
        credentialFormats: {
            indy: {
                credentialDefinitionId,
                attributes: [
                    { name: 'name', value: 'Jane Doe' },
                    { name: 'age', value: '23' },
                ],
            },
        },
    });
});
const createNewInvitation = (issuer) => __awaiter(void 0, void 0, void 0, function* () {
    const outOfBandRecord = yield issuer.oob.createInvitation();
    return {
        invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'https://example.org' }),
        outOfBandRecord,
    };
});
const receiveInvitation = (holder, invitationUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const { outOfBandRecord } = yield holder.oob.receiveInvitationFromUrl(invitationUrl);
    return outOfBandRecord;
});
const setupConnectionListener = (issuer, outOfBandRecord, cb) => {
    issuer.events.on(core_1.ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => __awaiter(void 0, void 0, void 0, function* () {
        if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id)
            return;
        if (payload.connectionRecord.state === core_1.DidExchangeState.Completed) {
            // the connection is now ready for usage in other protocols!
            console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`);
            // Custom business logic can be included here
            // In this example we can send a basic message to the connection, but
            // anything is possible
            yield cb(payload.connectionRecord.id);
        }
    }));
};
const flow = (issuer) => (connectionId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Registering the schema...');
    const schema = yield registerSchema(issuer);
    console.log('Registering the credential definition...');
    const credentialDefinition = yield registerCredentialDefinition(issuer, schema);
    console.log('Issuing the credential...');
    yield issueCredential(issuer, credentialDefinition.id, connectionId);
});
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Initializing the holder...');
    const holder = yield initializeHolderAgent();
    console.log('Initializing the issuer...');
    const issuer = yield initializeIssuerAgent();
    console.log('Initializing the credential listener...');
    setupCredentialListener(holder);
    console.log('Initializing the connection...');
    const { outOfBandRecord, invitationUrl } = yield createNewInvitation(issuer);
    setupConnectionListener(issuer, outOfBandRecord, flow(issuer));
    yield receiveInvitation(holder, invitationUrl);
});
void run();
