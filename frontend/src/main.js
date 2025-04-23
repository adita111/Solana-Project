import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import idl from "./idl/voting_system.json";



const programID = new PublicKey("CC6Hgbp1fGRXf1zj8gi3j5GyfrRwC1aTRnVvhP5oGLWe"); // Adresa programului tău
const network = clusterApiUrl("devnet");
const opts = {
  preflightCommitment: "processed",
};

let provider;
let program;

window.addEventListener("DOMContentLoaded", async () => {
  const connectBtn = document.getElementById("connectWalletBtn");
  const voteBtn = document.getElementById("voteBtn");

  connectBtn.addEventListener("click", async () => {
    try {
      const resp = await window.solana.connect();
      console.log("✅ Wallet conectat:", resp.publicKey.toString());
      provider = new AnchorProvider(new Connection(network, opts.preflightCommitment), window.solana, opts);
      program = new Program(idl, programID, provider);
    } catch (err) {
      console.error("❌ Eroare la conectarea walletului:", err);
    }
  });

  voteBtn.addEventListener("click", async () => {
    if (!program || !provider) {
      alert("Conectează walletul întâi!");
      return;
    }

    const user = provider.wallet.publicKey;
    const voteOption = document.getElementById("votOption").value === "Da";

    const [voteAccountPDA] = await web3.PublicKey.findProgramAddressSync(
      [Buffer.from("votare"), user.toBuffer()],
      programID
    );

    try {
      const tx = await program.methods
        .vote(voteOption)
        .accounts({
          voter: user,
          voteAccount: voteAccountPDA,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Vot trimis cu succes! TX:", tx);
    } catch (err) {
      console.error("❌ Eroare la trimiterea votului:", err);
    }
  });
});