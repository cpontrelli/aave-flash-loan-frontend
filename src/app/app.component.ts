import { Component } from '@angular/core';
import { BigNumber, Contract, ethers, utils } from 'ethers';
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
const FL_LEVERAGE_ADDRESS = '0x129Ca7ff8C681ee4640904e7fa1b09Bb584542Ac';
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

  async enterLeveragePosition(loan: number,  borrow: number) {
    // TODO:
    // Approve leverage contract for loan amount: approve(flashLoanLeverageContract.address, loan)
    // Delegate to leverage contract for borrow amount: approveDelegation(flashLoanLeverageContract.address, borrow);
    // Execute flash leverage: (userAddress, USDC_ADDRESS, loan, borrow);
  this.FLLeverageContract = new ethers.Contract(FL_LEVERAGE_ADDRESS, FlashLoanLeverageJson.abi, this.signer);
  const tx = await this.FLLeverageContract['approve'](this.signer?._address, loan);
  await tx.wait();
  console.log(`Loan amount approved`);

  }

  exitLeveragePosition(repay: number) {
    // TODO:
    // Approve exit contract for aUSDC repay amount: approve(flashLoanExitContract.address, repay * 1.01)
    // Execute flash exit: exitFlashLoan(userAddress, USDC_ADDRESS, AUSDC_ADDRESS, repay)
  }

}
