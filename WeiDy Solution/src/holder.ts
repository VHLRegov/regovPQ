import { InitConfig, WsOutboundTransport } from "@aries-framework/core";
import type { Express } from "express";

import {
    ConnectionInvitationMessage,
    LogLevel,
    Agent,
    AutoAcceptCredential,
    HttpOutboundTransport,
} from '@aries-framework/core';

import { agentDependencies, HttpInboundTransport } from "@aries-framework/node";
import { static as stx } from 'express';
import { connect } from "ngrok";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from 'typedi';
import fetch from 'node-fetch';

import { startServer } from "@aries-framework/rest";

import { AgentCleanup } from "./utils/AgentCleanup";
import { TestLogger } from './utils/logger'

const logger = new TestLogger(LogLevel.debug)

const getGenesisTransaction = async (url: string) => {
    const response = await fetch(url)
    return await response.text()
  }

const run = async () => {
    const genesisTransactionsBCovrinTestNet = await getGenesisTransaction('http://test.bcovrin.vonx.io/genesis');
    const endpoint = process.env.AGENT_ENDPOINT ?? (await connect(8000))
    
    const agentConfig: InitConfig = {
        label: 'MyBid',
        walletConfig: {
            id: 'Regov MyBid',
            key: 'MyBid',
        },
        indyLedgers: [
            {
                id: 'BCOVRIN_TEST_GENESIS',
                genesisTransactions: genesisTransactionsBCovrinTestNet,
                isProduction: false,
            },
        ],
        logger: logger,
        publicDidSeed: 'qPa9E2iIwV2Sh37aqEj3LS3oLjZhiu5B',
        endpoints: [endpoint],
        autoAcceptConnections: true,
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
        useLegacyDidSovPrefix: true,
        //connectionImageUrl:
    }

    const agent = new Agent(agentConfig, agentDependencies);

    const httpInbound = new HttpInboundTransport({ port: 8001});

    agent.registerInboundTransport(httpInbound);

    agent.registerOutboundTransport(new HttpOutboundTransport());

    agent.registerOutboundTransport(new WsOutboundTransport());
  

    await agent.initialize();
 
    const app: Express = createExpressServer({
        controllers: [__dirname + '/controllers/**/*.ts', __dirname + '/controllers/**/*.js'],
        cors: true,
        routePrefix: '/demo',
    })
    

    //app.use('/public', stx(__dirname + '/public'))

    const job = AgentCleanup(agent);
    job.start();
/*
    app.get('/server/last-reset', async (req, res) => {
        res.send(job.lastDate());
    })
*/
    await startServer(agent, {
        port: 8000,
        app: app,
      })

    logger.info(`Holder agent online at port 8000`)


}


run();
