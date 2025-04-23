import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import idl from "./idl/voting_system.json";

// Setări
const programID = new PublicKey(idl.metadata.address); // adresa programului din IDL
const network = clusterApiUrl("devnet"); // sau localnet dacă rulezi local
const connection = new Connection(network, "processed");

export async function vote(wallet, option) {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });

  const program = new Program(idl, programID, provider);

  // creează un cont pentru a salva votul
  const [voteAccount] = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), wallet.publicKey.toBuffer()],
    program.programId
  );

  try {
    const tx = await program.methods
      .vote(option)
      .accounts({
        voteAccount,
        voter: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Vot trimis cu succes! Tx:", tx);
  } catch (err) {
    console.error("❌ Eroare la trimiterea votului:", err);
  }
}
