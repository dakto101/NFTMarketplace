/* pages/resell-nft.js */
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function ResellNFT() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const router = useRouter()
  const { id, tokenURI } = router.query
  const { image, price } = formInput

  useEffect(() => {
    loadNFTs()
    fetchNFT()
    
  }, [id])


  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketplaceContract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await marketplaceContract.fetchMyNFTs()

    const items = await Promise.all(data.map(async i => {
      const tokenURI = await marketplaceContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenURI)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        tokenURI
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({ ...state, image: meta.data.image }))
  }

  function myNFTs() {
    router.push(`/my-nfts`)
  }



  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
      <img className="rounded mt-4 grid-cols-1" width="100%" src={image} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"></div>
      {
      nfts.filter(nft => nft.tokenId == id).map((nft, i) => (
        <div key={i} className="border shadow rounded-xl overflow-hidden">
          <div className="p-4 bg-white">
          <p className="text-2xl font-bold text-black">Price: {nft.price}</p>
          <p className="text-2xl font-bold text-black">Owner: {nft.owner}</p>
          <p className="text-2xl font-bold text-black">Seller: {nft.seller}</p>
          <p className="text-2xl font-bold text-black">Token ID: {nft.tokenId}</p>
          </div>
        </div>
      ))
      }

      <button onClick={myNFTs} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Back
      </button>
      </div>
    </div>
  )
}