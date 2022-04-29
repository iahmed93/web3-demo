import "./App.css";
import { ethers } from "ethers";

import {useState} from 'react';

let provider = undefined;

function App() {
  const [balance, setBalance] = useState(0);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signer, setSigner] = useState(undefined);
  const [network, setNetwork] = useState(undefined);
  const [address, setAddress] = useState("");

  const loginWithMetaMask = async () => {
    setIsSigningIn(true);
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setSigner(provider.getSigner());
    setBalance(ethers.utils.formatEther(await provider.getBalance(accounts[0])));
    setIsSigningIn(false);
    setAddress(accounts[0]);
    setNetwork(await provider.getNetwork());
  }

  return (
    <div className="App">
      <header className="App-header"> 
        <button
          onClick={loginWithMetaMask}
          type="button"
          disabled={signer? true : isSigningIn}
        >
          Login With MetaMask
        </button>
        <Balance balance={balance}/>
        <SendFundsForm signer={signer}/>
        <TransactionHistory network={network} address={address}/>
      </header>
    </div>
  );
}

function Balance(props) {
  return ( 
    <div>Balance: {props.balance}</div>
  );
}

function SendFundsForm(props) {
  const [values, setValues] = useState({
    toAddress: "",
    amount: ""
  });

  const [message, setMessage] = useState("");

  const handleToAddressInputChange = (event) => setValues({...values, toAddress: event.target.value});
  const handleAmountInputChange = (event) => setValues({...values, amount: event.target.value});

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await props.signer.sendTransaction({
        to: values.toAddress,
        value: ethers.utils.parseEther(values.amount)
      });
      setValues({toAddress: "", value: ""});
      setMessage("Fund Sent Successfully");
    } catch (error) {
      setMessage(error.message)
    }
    
  }

  return (
    <div>
      <h1>Send Funds</h1>
      <form onSubmit={handleSubmit}>
        <label>
          To:
          <input type="text" name="toAddress" onChange={handleToAddressInputChange} value={values.toAddress}/>
        </label>
        <label>
          Amount:
          <input type="text" name="amount" onChange={handleAmountInputChange} value={values.amount}/>
        </label>
        <input type="submit" value="Send" disabled={props.signer? false : true}/>
      </form>
      <p>{message}</p>
    </div>
  )
}


function TransactionHistory (props) {
  const [history, setHistory] = useState(undefined);
  let body = [];
  if (props.address !== "" && props.network){
    const getHistroy = async () => {
      const etherscanProvider = new ethers.providers.EtherscanProvider(props.network, "K8BM3GW3YU78A9RHTREDK7PNZ531UPS4ME");
      setHistory(await etherscanProvider.getHistory(props.address));
    }

    if (history){
      for (const [index, value] of history.entries()) {
        body.push(<tr key={index}>
          <td>
            <a href={"https://etherscan.io/tx/"+value.hash}>{value.hash}</a>
            
          </td>
          <td>{value.from}</td>
          <td>{value.to}</td>
          <td>{ethers.utils.formatEther(value.value)}</td>
        </tr>)
      }
    }
    
    return (
      <div>
        <button onClick={getHistroy}>Get History</button>  
        <table>
          <thead>
            <tr>
              <th>Hash</th>
              <th>From</th>
              <th>To</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {body}
          </tbody>
        </table>
      </div>
    )
  }
  return (
    <div></div>
  )
}


export default App;
