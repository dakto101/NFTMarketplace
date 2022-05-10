/* pages/index.js */
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";

import { marketplaceAddress } from "../config";

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);

  const router = useRouter();
  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider(
      "https://polygon-mumbai.infura.io/v3/88ae0db50107404793a217cdb3e29de4"
    );
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      provider
    );
    const data = await contract.fetchMarketItems();

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          tokenURI: tokenUri,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });
    await transaction.wait();
    loadNFTs();
  }
  function detailNFT(nft) {
    router.push(`/detail-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}&prev=`);
  }

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;
  return (
    <div>
      <div className="w-full m-3 max-w-xs border-solid border-2 border-gray">
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="search"
          placeholder="Search..."
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
        />
      </div>

      <div className="flex">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <h2 className="text-2xl py-2">Marketplace</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {nfts
              .filter((nft) =>
                nft.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="h-1/2 bg-cover">
                    <img src={nft.image} />
                  </div>
                  <div className="h-1/4 p-4">
                    <p
                      style={{ height: "64px" }}
                      className="text-2xl font-semibold"
                    >
                      {nft.name}
                    </p>
                    <div style={{ height: "70px", overflow: "hidden" }}>
                      <p className="text-gray-400">{nft.description}</p>
                    </div>
                  </div>
                  <div className="h-1/4 p-4 bg-black">
                    <p className="text-2xl font-bold text-white">
                      {nft.price} ETH
                    </p>
                    <button
                      className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                      onClick={() => buyNft(nft)}
                    >
                      Buy
                    </button>
                    <button
                      className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                      onClick={() => detailNFT(nft)}
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  /*
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div>
    <div class="w-full max-w-xs border-solid border-2 border-gray">
     <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="search" placeholder="Search..."
      onChange={(event) => {
        setSearchTerm(event.target.value)
      } } />
    </div>
    <div className="flex justify-center">
    <div className="px-4" style={{ maxWidth: '1600px', maxHeight: '199900px'}}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
    {nfts.filter((nft) => nft.name.toLowerCase().includes(searchTerm.toLowerCase())).map((nft, key) => {
      return (
        <div key={key} className="border shadow rounded-xl overflow-hidden">
          <img src={nft.image} />
          <div className="p-4">
            <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
            <div style={{ height: '70px', overflow: 'hidden' }}>
              <p className="text-gray-400">{nft.description}</p>
            </div>
          </div>
          <div className="p-4 bg-black">
            <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
            <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
            <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => detailNFT(nft)}>Detail</button>
          </div>
        </div>
      )
      })
      }
      </div>
      </div>
      </div>
    </div>
  )
  */
}
