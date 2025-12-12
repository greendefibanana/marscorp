import { useMemo } from 'react';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js';
// We will use the exchange IDL as the master IDL now
import exchangeIdl from '../marscorp-chain/target/idl/marscorp_exchange.json';
import { Buffer } from 'buffer';

const UNIFIED_PROGRAM_ID = new PublicKey("5GKfHwujgiKLXP84f28HyGL5FJ3AnunKsVGmKDmG6RXi");

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const RENT_SYSVAR_ID = new PublicKey("SysvarRent111111111111111111111111111111111");

function createATAInstruction(payer: PublicKey, associatedToken: PublicKey, owner: PublicKey, mint: PublicKey) {
    return new TransactionInstruction({
        keys: [
            { pubkey: payer, isSigner: true, isWritable: true },
            { pubkey: associatedToken, isSigner: false, isWritable: true },
            { pubkey: owner, isSigner: false, isWritable: false },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
}

export const useMarsProtocol = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const { connected } = useWallet();
    
    const provider = useMemo(() => {
        if (!wallet) return null;
        return new AnchorProvider(connection, wallet, {
            preflightCommitment: 'processed',
        });
    }, [connection, wallet]);

    const program = useMemo(() => {
        if (!provider) return null;
        return new Program(exchangeIdl as unknown as Idl, provider);
    }, [provider]);

    // --- UTILS ---
    const getAssociatedTokenAddress = (mint: PublicKey, owner: PublicKey) => {
        return PublicKey.findProgramAddressSync(
            [
                owner.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        )[0];
    };

    // --- PREDICTION MARKETS ---

    const createMarket = async (id: number, title: string, endTimestamp: number) => {
        if (!program || !wallet) throw new Error("Wallet not connected");
        try {
            const [marketAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("market"), new BN(id).toArrayLike(Buffer, 'le', 8)],
                program.programId
            );
            
            // @ts-ignore - IDL might not be updated in IDE yet
            const tx = await program.methods
                .createMarket(new BN(id), title, new BN(endTimestamp))
                .accounts({
                    market: marketAddress,
                    authority: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                } as any)
                .preInstructions([
                    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
                ])
                .rpc();
            console.log("Market created:", tx);
            return { tx, marketAddress };
        } catch (error) {
            console.error("Error creating market:", error);
            throw error;
        }
    };

    const placeBet = async (marketAddress: PublicKey, outcome: boolean, amount: number) => {
        if (!program || !wallet) throw new Error("Wallet not connected");
        try {
            // @ts-ignore
            const tx = await program.methods
                .placeBet(outcome, new BN(amount))
                .accounts({
                    market: marketAddress,
                    user: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                } as any)
                .preInstructions([
                    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
                ])
                .rpc();
            console.log("Bet placed:", tx);
            return tx;
        } catch (error) {
            console.error("Error placing bet:", error);
            throw error;
        }
    };

    const resolveMarket = async (marketAddress: PublicKey, outcome: boolean) => {
        if (!program || !wallet) throw new Error("Wallet not connected");
        try {
            // @ts-ignore
            const tx = await program.methods
                .resolveMarket(outcome)
                .accounts({
                    market: marketAddress,
                    oracle: wallet.publicKey,
                } as any)
                .preInstructions([
                    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
                ])
                .rpc();
            console.log("Market resolved:", tx);
            return tx;
        } catch (error) {
            console.error("Error resolving market:", error);
            throw error;
        }
    };

    // --- BUSINESS LAUNCHPAD (Bonding Curve) ---

    const initializeConfig = async (platformFeeBps: number, yieldFeeBps: number) => {
        if (!program || !wallet) throw new Error("Wallet not connected");
        
        try {
            const [configAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("config")],
                program.programId
            );

            // @ts-ignore
            const tx = await program.methods
                .initializeConfig(platformFeeBps, yieldFeeBps)
                .accounts({
                    config: configAddress,
                    admin: wallet.publicKey,
                    yieldDistributor: wallet.publicKey, 
                    systemProgram: SystemProgram.programId,
                } as any)
                .preInstructions([
                    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
                ])
                .rpc();
            
            console.log("Protocol Config Initialized:", tx);
            return tx;
        } catch (error) {
            console.error("Error initializing config:", error);
            throw error;
        }
    };

    const launchBusiness = async (ticker: string, name: string, description: string, sector: string) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        try {
            const [mintAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("mint"), wallet.publicKey.toBuffer(), Buffer.from(ticker)],
                program.programId
            );

            const [curveAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("curve"), mintAddress.toBuffer()],
                program.programId
            );

            const [vestingAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("vesting"), mintAddress.toBuffer()],
                program.programId
            );

            const [configAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("config")],
                program.programId
            );

            const curveTokenVault = getAssociatedTokenAddress(mintAddress, curveAddress);
            const [vestingTokenVault] = PublicKey.findProgramAddressSync(
                [Buffer.from("vesting_vault"), mintAddress.toBuffer()],
                program.programId
            );
            
            let sectorEnum = { tech: {} }; 
            if (sector.toLowerCase().includes('mining')) sectorEnum = { mining: {} };
            else if (sector.toLowerCase().includes('energy')) sectorEnum = { energy: {} };
            else if (sector.toLowerCase().includes('terra')) sectorEnum = { terraforming: {} };

            // @ts-ignore
            const tx = await program.methods
                .createBusiness(name, ticker, description, sectorEnum)
                .accounts({
                    config: configAddress,
                    mint: mintAddress,
                    curve: curveAddress,
                    vesting: vestingAddress,
                    curveTokenVault: curveTokenVault,
                    vestingTokenVault: vestingTokenVault,
                    creator: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    rent: RENT_SYSVAR_ID,
                } as any)
                .preInstructions([
                    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
                ])
                .rpc();

            console.log("Business Launched:", tx);
            return { tx, mintAddress, curveAddress };
        } catch (error) {
            console.error("Error launching business:", error);
            throw error;
        }
    };

    const createBusiness = async (ticker: string, name: string, description: string, sector: string) => {
        return launchBusiness(ticker, name, description, sector);
    };

    const swap = async (ticker: string, amount: number, isBuy: boolean) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        let mintAddress: PublicKey;
        try {
            // Assuming ticker is Mint Address for now
            mintAddress = new PublicKey(ticker);
        } catch (e) {
            console.error("Swap failed: Invalid Mint Address passed as ticker");
            throw new Error("Invalid Mint Address");
        }

        const [curveAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("curve"), mintAddress.toBuffer()],
            program.programId
        );

        const curveTokenVault = getAssociatedTokenAddress(mintAddress, curveAddress);
        const userTokenAccount = getAssociatedTokenAddress(mintAddress, wallet.publicKey);
        
        // Protocol Admin Address (Fixed from Initialization)
        const ADMIN_PUBKEY = new PublicKey("9BeBqNy15zt5mq112RrR35GaHNoqkPNFe1brhtEocdpU");
        const adminTreasury = ADMIN_PUBKEY; 
        const yieldDistributor = ADMIN_PUBKEY; 

        const [configAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            program.programId
        );

        // Check if User ATA exists
        const preInstructions = [
            ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
        ];

        try {
            const accountInfo = await connection.getAccountInfo(userTokenAccount);
            if (!accountInfo) {
                console.log("User Token Account missing. Adding creation instruction...");
                preInstructions.push(
                    createATAInstruction(wallet.publicKey, userTokenAccount, wallet.publicKey, mintAddress)
                );
            }
        } catch (e) {
            console.warn("Failed to check token account existence:", e);
        }

        // @ts-ignore
        const tx = await program.methods
            .swap(isBuy, new BN(amount), new BN(0))
            .accounts({
                config: configAddress,
                curve: curveAddress,
                user: wallet.publicKey,
                userTokenAccount: userTokenAccount,
                curveTokenVault: curveTokenVault,
                adminTreasury: adminTreasury,
                yieldDistributor: yieldDistributor,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            } as any)
            .preInstructions(preInstructions)
            .rpc();
        
        console.log("Swap executed:", tx);
        return tx;
    };

    const buyShares = (mintAddress: string, amountLamports: number) => swap(mintAddress, amountLamports, true);
    const sellShares = (mintAddress: string, amountTokens: number) => swap(mintAddress, amountTokens, false);

    // --- GAME MECHANICS ---

    const initiateTakeover = async (mintStr: string) => {
        if (!program || !wallet) throw new Error("Wallet not connected");
        
        const mintAddress = new PublicKey(mintStr);
        const [curveAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("curve"), mintAddress.toBuffer()],
            program.programId
        );
        const userTokenAccount = getAssociatedTokenAddress(mintAddress, wallet.publicKey);

        // @ts-ignore
        const tx = await program.methods
            .initiateTakeover()
            .accounts({
                curve: curveAddress,
                user: wallet.publicKey,
                userTokenAccount: userTokenAccount
            } as any)
            .preInstructions([
                ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
            ])
            .rpc();

        console.log("Takeover Initiated:", tx);
        return tx;
    };

    const sabotage = async (mintStr: string) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const mintAddress = new PublicKey(mintStr);
        const [curveAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("curve"), mintAddress.toBuffer()],
            program.programId
        );

        const [configAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            program.programId
        );
        
        // Protocol Admin Address (Fixed from Initialization)
        const ADMIN_PUBKEY = new PublicKey("9BeBqNy15zt5mq112RrR35GaHNoqkPNFe1brhtEocdpU");
        const adminTreasury = ADMIN_PUBKEY; 
        const yieldDistributor = ADMIN_PUBKEY; 

        // @ts-ignore
        const tx = await program.methods
            .sabotage()
            .accounts({
                config: configAddress,
                curve: curveAddress,
                user: wallet.publicKey,
                adminTreasury: adminTreasury,
                yieldDistributor: yieldDistributor,
                systemProgram: SystemProgram.programId,
            } as any)
            .preInstructions([
                ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
            ])
            .rpc();

        console.log("Sabotage Executed:", tx);
        return tx;
    };

    return {
        program,
        exchangeProgram: program, // Alias for compatibility
        isConnected: connected,
        createMarket,
        placeBet,
        resolveMarket,
        initializeConfig,
        createBusiness,
        launchBusiness,
        buyShares,
        sellShares,
        initiateTakeover,
        sabotage
    };
};