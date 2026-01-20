"use client"

import AddItemsPanel from "@/components/AddItemsPanel"

const AddProductPage = () => {
  return (
    <section className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add Items</h1>
        <p className="text-sm text-gray-600">
          Use manual, voice, image, or barcode flows to add inventory.
        </p>
      </div>
      <AddItemsPanel />
    </section>
  )
}

export default AddProductPage
