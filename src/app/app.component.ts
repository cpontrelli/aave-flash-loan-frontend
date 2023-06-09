import { Component } from '@angular/core';
import { Contract, ethers, utils } from 'ethers';
import { ExternalProvider } from "@ethersproject/providers";
import IPoolJson from "../assets/IPool.json";
import ERC20Json from "../assets/ERC20.json";
import FlashLoanExitJson from "../assets/FlashLoanExit.json";
import FlashLoanLeverageJson from "../assets/FlashLoanLeverage.json";
import IATokenJson from "../assets/IAToken.json";
import ICreditDelegationTokenJson from "../assets/ICreditDelegationToken.json";

const POOL_ADDRESS = '0x7b5C526B7F8dfdff278b4a3e045083FBA4028790';
const USDC_ADDRESS = '0x65aFADD39029741B3b8f0756952C74678c9cEC93';
const AUSDC_ADDRESS = '0x8Be59D90A7Dc679C5cE5a7963cD1082dAB499918';
const USDC_DEBT_ADDRESS = '0x4DAe67e69aCed5ca8f99018246e6476F82eBF9ab';
const FL_LEVERAGE_ADDRESS = '0xe2E3F88200C6e63A14dad0E6596bbED426b74B56';
const FL_EXIT_ADDRESS = '0x5a4a5690b427DB7514D4588a0193D3f3f421BE43';

// Metamask will inject the ethereum object to DOM
declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  provider: ethers.providers.Web3Provider
  blockNumber: number | string | undefined;
  signer: ethers.providers.JsonRpcSigner | undefined;
  userAddress: string | undefined;
  poolContract: Contract | undefined;
  USDCContract: Contract | undefined;
  AUSDCContract: Contract | undefined;
  USDCDebtContract: Contract | undefined;
  FLLeverageContract: Contract | undefined;
  FLExitContract: Contract | undefined;
  
  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, 'goerli');
    this.getPoolContract();
    this.getUSDCContract();
    this.getAUSDCContract();
    this.getUSDCDebtContract();
    this.getFLLeverageContract();
    this.getFLExitContract();
  }

  getPoolContract() {
    this.poolContract = new Contract(
      POOL_ADDRESS,
      IPoolJson.abi,
      this.provider
    );
  }

  getUSDCContract() {
    this.USDCContract = new Contract(
      USDC_ADDRESS,
      ERC20Json.abi,
      this.provider
    );
  }

  getAUSDCContract() {
    this.AUSDCContract = new Contract(
      AUSDC_ADDRESS,
      IATokenJson.abi,
      this.provider
    );
  }

  getUSDCDebtContract() {
    this.USDCDebtContract = new Contract(
      USDC_DEBT_ADDRESS,
      ICreditDelegationTokenJson.abi,
      this.provider
    );
  }

  getFLLeverageContract() {
    this.FLLeverageContract = new Contract(
      FL_LEVERAGE_ADDRESS,
      FlashLoanLeverageJson.abi,
      this.provider
    );
  }

  getFLExitContract() {
    this.FLExitContract = new Contract(
      FL_EXIT_ADDRESS,
      FlashLoanExitJson.abi,
      this.provider
    );
  }

  connectWallet() {
    // Request the signer to connect
    this.provider.send("eth_requestAccounts", []).then(() => {
      this.signer = this.provider.getSigner();
      this.signer.getAddress().then((address) => {
        this.userAddress = address;
      });
    });
  }

  async enterLeveragePosition(loan: string,  supply: string) {
    if(!this.signer) return;

    const debtAmount = (parseFloat(loan) - parseFloat(supply)) * 1.01;

    const approveTx = await this.USDCContract?.connect(this.signer)['approve'](FL_LEVERAGE_ADDRESS, ethers.utils.parseUnits(supply, 6));
    await approveTx.wait();

    const debtTx = await this.USDCDebtContract?.connect(this.signer)['approveDelegation'](FL_LEVERAGE_ADDRESS, ethers.utils.parseUnits(debtAmount.toString(), 6));
    await debtTx.wait();

    const flashLoanTx = await this.FLLeverageContract?.connect(this.signer)['flashLoanLeverage'](
      this.userAddress,
      USDC_ADDRESS,
      ethers.utils.parseUnits(loan, 6),
      ethers.utils.parseUnits(supply, 6)
    );
    await flashLoanTx.wait();
  }

  async exitLeveragePosition(repay: string) {
    const approvalAmount = parseFloat(repay) * 1.01;

    if(!this.signer) return;

    const approveTx = await this.AUSDCContract?.connect(this.signer)['approve'](FL_EXIT_ADDRESS, ethers.utils.parseUnits(approvalAmount.toString(), 6));
    await approveTx.wait();

    const flashLoanTx = await this.FLExitContract?.connect(this.signer)['exitFlashLoan'](this.userAddress, USDC_ADDRESS, AUSDC_ADDRESS, ethers.utils.parseUnits(repay, 6));
    await flashLoanTx.wait();
  }

  stringToFloat(str: string){
    console.log('poop');
    return parseFloat(str); 
  }

}
