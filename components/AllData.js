"use client"
import { useEffect, useState } from "react";
import { columns } from "./Columns";
import DataTable from "./DataTable";
import { api } from "@/lib/api";

const AllData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const items = await api.get("/api/inventory");
        setData(items);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 60000); // Fetch data every minute (adjust as needed)

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run the effect only once, when the component mounts

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default AllData;
