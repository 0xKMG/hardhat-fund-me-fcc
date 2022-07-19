import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constant.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", fund);
balanceButton.addEventListener("click", getBalance);
withdrawButton.addEventListener("click", withdraw);

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        connectButton.innerHTML = "Connected!";
    } else {
        connectButton.innerHTML = "Please install metamask!";
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== "undefined") {
        //provider /connection to the blockchain
        //signer /wallet /someone with some gas
        // contract that we are interating with i.e ABI and address
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount)
            });
            //listen for the tx to be mined
            await listenForTransactionMine(transactionResponse, provider);
            console.log("done!!!");
        } catch (error) {
            console.log(error);
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("withdrawing...........");
        //provider /connection to the blockchain
        //signer /wallet /someone with some gas
        // contract that we are interating with i.e ABI and address
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();
            //listen for the tx to be mined
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Finish withdrawing");
        } catch (error) {
            console.log(error);
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}....`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, transactionReceipt => {
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
            resolve();
        });
    });
}
