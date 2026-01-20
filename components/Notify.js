import Link from 'next/link'
import React from 'react'
const Notify = ({heading,subtext,link}) => {

   
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
    <h2 className="text-lg font-semibold">{heading}</h2>
    <p className="text-gray-600">{subtext}</p>
    <Link href={link} className="text-blue-500 hover:underline">Read more</Link>
  </div>
  )
}

export default Notify