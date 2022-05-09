/* pages/dashboard.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreatorDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  const router = useRouter()
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await contract.fetchItemsListed()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        tokenURI : tokenUri
      }
      return item
    }))

    setNfts(items)
    setLoadingState('loaded') 
  }
  /**
   * Detail NFT
   * 
   * @param {nft} nft 
   */
  function detailNFT(nft) {
    router.push(`/detail-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}&prev=dashboard`)
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>)
  return (
    <div>
    <div class="w-full m-3 max-w-xs border-solid border-2 border-gray">
     <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="search" placeholder="Search..."
      onChange={(event) => {
        setSearchTerm(event.target.value)
      } } />
    </div>
    <div>
      <div className="p-4" style={{ maxWidth: '1600px' }}>
        <h2 className="text-2xl py-2">Items Listed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.filter(nft => nft.name.toLowerCase().includes(searchTerm.toLowerCase())).map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => detailNFT(nft)}>Detail</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
    </div>
  )
}