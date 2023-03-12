## WeiDY Solution
Clone the repository.
```git
git clone  https://github.com/VHLRegov/regovPQ.git
```
change into 'WeiDY Solution' folder.
```bash
cd 'WeiDy Solution'
```

### Set Enviornment variables
| Variable                | Description                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `AGENT_PUBLIC_DID_SEED` | Should be set to your agent's public DID in development/production. |
| `AGENT_ENDPOINT`        | Should be set to your agent's endpoint in development/production.   |
| `AGENT_WALLET_KEY`      | Should be set to your agent's wallet key in development/production. |


### Install Dependencies

```bash
yarn install
```

### Docker

Make sure you have Docker installed in your system (Ubuntu).
Now Run:
```docker
docker compose up
```
This will run the applicaation and logs will be displayed on terminal.<br />
Swagger API can be accessed on 
```bash
localhost:9000
```
