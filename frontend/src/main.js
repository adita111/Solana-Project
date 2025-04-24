import { Buffer } from "buffer";
window.Buffer = Buffer;

import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "./idl/voting_system.json";

// Program ID luat din IDL
const programID = new PublicKey(idl.address);
// Conectare la Devnet
const network = clusterApiUrl("devnet");
const connection = new Connection(network, "processed");

// Creează un provider Anchor din Phantom wallet
function getProvider() {
  if (window.solana && window.solana.isPhantom) {
    return new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
  }
  throw new Error("Phantom Wallet nu este instalat");
}

// Buton Connect Wallet
document.getElementById("connectWalletBtn").onclick = async () => {
  try {
    const resp = await window.solana.connect();
    console.log("✅ Wallet conectat:", resp.publicKey.toString());
  } catch (err) {
    console.error("❌ Eroare conectare wallet:", err);
  }
};

// Buton “Deconectează Wallet”
document.getElementById("disconnectWalletBtn").onclick = async () => {
  try {
    await window.solana.disconnect();
    console.log("✅ Wallet deconectat");
  } catch (err) {
    console.error("❌ Eroare la deconectarea walletului:", err);
  }
}

// Buton Initialize VoteAccount
document.getElementById("initBtn").onclick = async () => {
  const provider = getProvider();
  const program = new Program(idl, provider);

  // PDA derivat folosind seed-ul "vote"
  const [voteAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vote")],
    program.programId
  );

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

// Buton Cast Vote
document.getElementById("voteBtn").onclick = async () => {
  const provider = getProvider();
  const program = new Program(idl, programID, provider);

  // Derivare PDA aceeași ca la initialize
  const [voteAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vote")],
    program.programId
  );

  try {
    await program.methods
      .castVote()
      .accounts({
        voteAccount: voteAccountPDA,
        voter: provider.wallet.publicKey,
      })
      .rpc();
    console.log("✅ A votat cu succes pe:", voteAccountPDA.toBase58());
  } catch (err) {
    console.error("❌ Eroare la castVote:", err);
  }
};
