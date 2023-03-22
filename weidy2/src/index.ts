import {
    InitConfig,
    Agent,
    WsOutboundTransport,
    HttpOutboundTransport,
    ConnectionEventTypes,
    ConnectionStateChangedEvent,
    DidExchangeState,
    AutoAcceptCredential,
    CredentialEventTypes,
    CredentialState,
    CredentialStateChangedEvent,
    OutOfBandRecord,
    LogLevel
  } from '@aries-framework/core'
  import { startServer } from "@aries-framework/rest";
  import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
  import { Schema } from 'indy-sdk'
  import fetch from 'node-fetch'

  import { TestLogger } from './utils/logger'

  const logger = new TestLogger(LogLevel.debug)
  
  const getGenesisTransaction = async (url: string) => {
    const response = await fetch(url)
  
    return await response.text()
  }
  
  const initializeHolderAgent = async () => {
    const genesisTransactionsBCovrinTestNet = await getGenesisTransaction('http://test.bcovrin.vonx.io/genesis')
   
    const config: InitConfig = {
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
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      autoAcceptConnections: true,
      endpoints: ['http://localhost:3002'],
    }
  
    // A new instance of an agent is created here
    const agent = new Agent(config,  agentDependencies )
  
    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new WsOutboundTransport())
  
    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new HttpOutboundTransport())
  
    // Register a simple `Http` inbound transport
    agent.registerInboundTransport(new HttpInboundTransport({ port: 3002 }))
  
    // Initialize the agent
    await agent.initialize()
  
    return agent
  }
  
  const initializeIssuerAgent = async () => {
    const genesisTransactionsBCovrinTestNet = await getGenesisTransaction('http://test.bcovrin.vonx.io/genesis')
  
    const config: InitConfig = {
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
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      autoAcceptConnections: true,
      endpoints: ['http://localhost:3001'],
    }
  
    // A new instance of an agent is created here
    const agent = new Agent(config, agentDependencies )
  
    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new WsOutboundTransport())
  
    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new HttpOutboundTransport())
  
    // Register a simple `Http` inbound transport
    agent.registerInboundTransport(new HttpInboundTransport({ port: 3001 }))
  
    // Initialize the agent
    await agent.initialize()

  
    return agent
  }
  
  const registerSchema = async (issuer: Agent) =>
    issuer.ledger.registerSchema({ attributes: ['name', 'age'], name: 'myBid', version: '25.0' })
  
  const registerCredentialDefinition = async (issuer: Agent, schema: Schema) =>
    issuer.ledger.registerCredentialDefinition({ schema, supportRevocation: false, tag: 'default' })
  
  const setupCredentialListener = (holder: Agent) => {
    holder.events.on<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged, async ({ payload }) => {
      switch (payload.credentialRecord.state) {
        case CredentialState.OfferReceived:
          console.log('received a credential')
          // custom logic here
          await holder.credentials.acceptOffer({ credentialRecordId: payload.credentialRecord.id })
        case CredentialState.Done:
          console.log(`Credential for credential id ${payload.credentialRecord.id} is accepted`)
          // For demo purposes we exit the program here.
          process.exit(0)
      }
    })
  }
  
  const issueCredential = async (issuer: Agent, credentialDefinitionId: string, connectionId: string) =>
    issuer.credentials.offerCredential({
      protocolVersion: 'v1',
      connectionId,
      credentialFormats: {
        indy: {
          credentialDefinitionId,
          attributes: [
            { name: 'name', value: 'Regov' },
            { name: 'age', value: '25' },
          ],
        },
      },
    })
  
  const createNewInvitation = async (issuer: Agent) => {
    const outOfBandRecord = await issuer.oob.createInvitation()
  
    return {
      invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'https://example.org' }),
      outOfBandRecord,
    }
  }
  
  const receiveInvitation = async (holder: Agent, invitationUrl: string) => {
    const { outOfBandRecord } = await holder.oob.receiveInvitationFromUrl(invitationUrl)
  
    return outOfBandRecord
  }
  
  const setupConnectionListener = (
    issuer: Agent,
    outOfBandRecord: OutOfBandRecord,
    cb: (...args: any) => Promise<unknown>
  ) => {
    issuer.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, async ({ payload }) => {
      if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return
      if (payload.connectionRecord.state === DidExchangeState.Completed) {
        console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`)
  
        await cb(payload.connectionRecord.id)
      }
    })
  }
  
  const flow = (issuer: Agent) => async (connectionId: string) => {
    console.log('Registering the schema...')
    const schema = await registerSchema(issuer)
    console.log('Registering the credential definition...')
    const credentialDefinition = await registerCredentialDefinition(issuer, schema)
    console.log('Issuing the credential...')
    await issueCredential(issuer, credentialDefinition.id, connectionId)
  }
  
  const run = async () => {
    console.log('Initializing the holder...')
    const holder = await initializeHolderAgent()
    console.log('Initializing the issuer...')
    const issuer = await initializeIssuerAgent()
  
    console.log('Initializing the credential listener...')
    setupCredentialListener(holder)
  
    console.log('Initializing the connection...')
    const { outOfBandRecord, invitationUrl } = await createNewInvitation(issuer)
    setupConnectionListener(issuer, outOfBandRecord, flow(issuer))
    await receiveInvitation(holder, invitationUrl)
  }
  
  void run()
  