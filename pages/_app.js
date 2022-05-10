/* pages/_app.js */
import "../styles/globals.css";
import Link from "next/link";
import ConnectButton from "./login/ConnectButton";
import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
import { DAppProvider } from "@usedapp/core";
import AccountModal from "./login/AccountModal";

function MyApp({ Component, pageProps }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <div>
      <nav className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-3xl">Infinity Marketplace</p>
          </div>
          <div className="flex gap-10">
            <Link href="/">
              <a className="text-xl font-medium">🛒 Home</a>
            </Link>
            <Link href="/create-nft">
              <a className="text-xl font-medium">💸 Sell NFT</a>
            </Link>
            <Link href="/my-nfts">
              <a className="text-xl font-medium">🖼️ My NFTs</a>
            </Link>
            <Link href="/dashboard">
              <a className="text-xl font-medium">📑 Dashboard</a>
            </Link>
          </div>
          <div>
            <DAppProvider config={{}}>
              <ChakraProvider>
                <ConnectButton handleOpenModal={onOpen} />
                <AccountModal isOpen={isOpen} onClose={onClose} />
              </ChakraProvider>
            </DAppProvider>
          </div>
        </div>
      </nav>

      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
