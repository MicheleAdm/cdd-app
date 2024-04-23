import { Configurations } from "./Configurations";
import { getAllConfs } from "../api/confsApis";
import { useEffect, useState } from "react";
import { ItemList } from "./ItemList";
import { getItems } from "../api/itemApis";

export const Main = () => {
  console.log("Render!!");
  const [confs, setConfs] = useState([]);
  const [items, setItems] = useState(null);

  const fetchConfs = async () => {
    const result = await getAllConfs();
    console.log("Confs from backend", result.data.confs);
    setConfs(result.data.confs);
  };

  const fetchItems = async () => {
    try {
      const res = await getItems();
      setItems(res.data.items);
    } catch (error) {
      setItems({ err: "Cannot fetch items!!" });
      return;
    }
  };

  useEffect(() => {
    fetchConfs();
    fetchItems();
  }, []);

  return (
    <div>
      <Configurations confs={confs} />
      <ItemList items={items} />
    </div>
  );
};
