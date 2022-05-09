/* pages/detail-nft.js */
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function DetailNFT() {
  const [nfts, setNfts] = useState([])
  const [myNfts, setMyNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [formInput, updateFormInput] = useState({ price: '', image: '', name: '', description: ''})
  const router = useRouter()
  const { id, tokenURI, prev } = router.query
  const { image, price, name, description } = formInput

  useEffect(() => {
    loadNFTs()
    loadMyNFTs()
    fetchNFT()
    
  }, [id])

  async function loadNFTs() {
    //Set NFTs
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
    const data = await contract.fetchMarketItems()

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
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
  async function loadMyNFTs() {
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
        description: meta.data.description,
        name: meta.data.name,
        tokenURI
      }
      return item
    }))
    setMyNfts(items)
    setLoadingState('loaded') 
  }


  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({ ...state, image: meta.data.image, name: meta.data.name, description: meta.data.description }))
  }

  function back() {
    router.push(`/${prev}`)
  }



  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"></div>
      <img className="rounded mt-4 grid-cols-1" width="100%" src={image} />
      <div className="border shadow rounded-xl overflow-hidden">
        <p className="text-xl font-bold text-black">Detail NFT: </p>
        <p className="text-xl text-black"> Name: {name} </p>
        <p className="text-xl text-black"> Description: {description} </p>
        {
        nfts.filter(nft => nft.tokenId == id).map((nft, i) => (
            <div>
            <p className="text-xl text-black">Token ID: {nft.tokenId}</p>
            <p className="text-xl text-black">Price: {nft.price} ETH</p>
            <p className="text-xl text-black">Owner: {nft.owner}</p>
            <p className="text-xl text-black">Seller: {nft.seller}</p>
            </div>
        ))
        
        }
        {
        myNfts.filter(nft => nft.tokenId == id).map((nft, i) => (
            <div>
            <p className="text-xl text-black">Token ID: {nft.tokenId}</p>
            <p className="text-xl text-black">Price: {nft.price} ETH</p>
            <p className="text-xl text-black">Owner: {nft.owner}</p>
            <p className="text-xl text-black">Seller: {nft.seller}</p>
            </div>
        ))
        }
      </div>

      <button onClick={back} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Back
      </button>
      </div>
    </div>
  )
}