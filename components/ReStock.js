"use client"
import { useEffect, useState } from "react";
import { columns } from "./Columns";
import DataTable from "./DataTable";
import { api } from "@/lib/api";

const ReStockComponent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {

        try {
            const items = await api.get("/api/inventory");
            let updatedInventory = items.filter(item => item.quantity < 10);
            setData(updatedInventory);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    fetchUserData();
  

    // Setup polling to fetch data at regular intervals
    const intervalId = setInterval(fetchUserData, 60000); // Fetch data every minute (adjust as needed)

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
}, []);


  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default ReStockComponent;
