import { CredentialExchangeRecord, utils } from "@aries-framework/core";
import type { CredDef } from 'indy-sdk';

import { Agent } from '@aries-framework/core';
import { Inject, Service } from "typedi";

@Service()
export class CredDefService {
    @Inject()
    private agent: Agent
    private credentialDefinitions: CredDef[] = []

    public constructor(agent: Agent) {
        this.agent = agent
        this.init()
    }

    public getCredentialDefinitionIdByTag(tag: string) {
        const def = this. credentialDefinitions.find((x) => x.tag === tag )

        if (!def) {
            throw new Error(`CredentialDefinition not found for ${tag}`)
        }

        return def.id
    }

    public async getAll() {
        if (this.credentialDefinitions.length === 0) {
            await this.init()
        }
        return this.credentialDefinitions
    }

    public async getAllCredentialsByConnectionId(connectionId: string) {
        const credentials = await this.agent.credentials.getAll()
        const filtered = credentials.filter((cred) => cred.connectionId === connectionId)

        return filtered.map((c) => c.toJSON())
    }

    private async init() {
        const cd1 = await this.createCredentialDefinition({
            schemaId: "q7ATwTYbQDgiigVijUAej:2:Master's Degree:1.0.0",
            supportRevocation: false,
            tag: 'Regov ID Card',
          })

          const cd2 = await this.createCredentialDefinition({
            schemaId: 'q7ATwTYbQDgiigVijUAej:2:Gym Membership:1.0',
            supportRevocation: false,
            tag: 'gym ID Card',
          })

          this.credentialDefinitions = [cd1, cd2]
    }

/*
    private async registerSchema(name: string) {
        const schemaTemplate = {
            name: name + utils.uuid(),
            version: '1.0.0',
            attributes: ['name', 'degree', 'date'],
        }

        const schema = await this.agent.ledger.registerSchema(schemaTemplate)

        return schema
    }
*/

    private async createCredentialDefinition(credentialDefinitionRequest: {
        schemaId: string
        supportRevocation: boolean
        tag: string
    }) {

        const schema = await this.agent.ledger.getSchema(credentialDefinitionRequest.schemaId);

        return await this.agent.ledger.registerCredentialDefinition({
            schema,
            supportRevocation: credentialDefinitionRequest.supportRevocation,
            tag: credentialDefinitionRequest.tag,
        })
    }
}
