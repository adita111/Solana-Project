import { Buffer } from "buffer";
window.Buffer = Buffer;

import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "./idl/voting_system.json";

// SETĂRI
const SEED = "voteX2";
const network = clusterApiUrl("devnet");
const connection = new Connection(network, "processed");

// Obține provider din Phantom Wallet
function getProvider() {
  if (window.solana && window.solana.isPhantom) {
    return new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
  }
  throw new Error("Phantom Wallet nu este instalat");
}

// Conectare wallet
document.getElementById("connectWalletBtn").onclick = async () => {
  try {
    const resp = await window.solana.connect();
    console.log("✅ Wallet conectat:", resp.publicKey.toString());
  } catch (err) {
    console.error("❌ Eroare conectare wallet:", err);
  }
};

// Deconectare wallet
document.getElementById("disconnectWalletBtn").onclick = async () => {
  try {
    await window.solana.disconnect();
    console.log("✅ Wallet deconectat");
  } catch (err) {
    console.error("❌ Eroare la deconectarea walletului:", err);
  }
};

// Initializează contul VoteAccount (o singură dată)
document.getElementById("initBtn").onclick = async () => {
  const provider = getProvider();
  const program = new Program(idl, provider);
  const [voteAccountPDA] = PublicKey.findProgramAddressSync([Buffer.from(SEED)], program.programId);

  try {
    await program.methods
      .initialize()
      .accounts({
        voteAccount: voteAccountPDA,
        user: provider.wallet.publicKey,
        systemProgram: PublicKey.default,
      })
      .rpc();
    console.log("✅ Cont VoteAccount inițializat:", voteAccountPDA.toBase58());
  } catch (err) {
    console.error("❌ Eroare la initialize:", err);
  }
};

// Trimite votul
document.getElementById("voteBtn").onclick = async () => {
  const provider = getProvider();
  const program = new Program(idl, provider);
  const [voteAccountPDA] = PublicKey.findProgramAddressSync([Buffer.from(SEED)], program.programId);

  try {
    await program.methods
      .castVote()
      .accounts({
        voteAccount: voteAccountPDA,
        voter: provider.wallet.publicKey,
      })
      .rpc();
    console.log("✅ Vot înregistrat!");
    await checkIfVoted(); // 🔄 actualizează statusul imediat
  } catch (err) {
    console.error("❌ Eroare la vot:", err);
  }
};

// Verifică dacă wallet-ul curent a votat + total voturi
document.getElementById("checkVoteBtn").onclick = async () => {
  await checkIfVoted();
};

// Afișează statusul votului + total voturi
async function checkIfVoted() {
  const provider = getProvider();
  const program = new Program(idl, provider);
  const [voteAccountPDA] = PublicKey.findProgramAddressSync([Buffer.from(SEED)], program.programId);

  try {
    const account = await program.account.voteAccount.fetch(voteAccountPDA);
    const voters = account.voters.map(v => v.toBase58());
    const wallet = provider.wallet.publicKey.toBase58();

    const statusEl = document.getElementById("voteStatus");
    const totalEl = document.getElementById("totalVotes");

    if (voters.includes(wallet)) {
      statusEl.innerText = "✅ Ai votat deja!";
    } else {
      statusEl.innerText = "❌ Nu ai votat încă.";
    }

    totalEl.innerText = `🔢 Total voturi: ${account.totalVotes.toString()}`;
  } catch (err) {
    console.error("Eroare la verificare vot:", err);
    document.getElementById("voteStatus").innerText = "⚠️ Nu s-a putut verifica.";
    document.getElementById("totalVotes").innerText = "";
  }
}
