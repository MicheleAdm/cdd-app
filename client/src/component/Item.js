import { useParams } from "react-router-dom";
import { getItemById } from "../api/itemApis";
import { useState, useEffect } from "react";

export const Item = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  const fetchItem = async () => {
    try {
      const res = await getItemById(id);
      setItem(res.data);
    } catch (err) {
      console.log(err);
      setItem({ error: "Could not load item!" });
      return;
    }
  };

  useEffect(() => {
    fetchItem();
  }, []);

  if (!item) {
    return <p>Loading item...</p>;
  }

  if (item.error) {
    return <p>{item.error}</p>;
  }

  return (
    <div className="item-container">
      <h3>{id}</h3>
      <FieldList itemData={item.data} />
      <p>
        <strong>Total price: {item.totalPrice}</strong>
      </p>
    </div>
  );
};

const FieldList = ({ itemData }) => {
  return (
    <>
      {Object.keys(itemData).map((objKey) => {
        const data = itemData[objKey];
        return (
          <ul key={objKey}>
            <FieldWrapper objKey={objKey} objValue={data} />
          </ul>
        );
      })}
    </>
  );
};

const FieldWrapper = ({ objKey, objValue }) => {
  console.log(objValue);

  if (objValue.isComplex) {
    return (
      <>
        {objKey}: <FieldList itemData={objValue.value} />
      </>
    );
  }

  if (objValue.value instanceof Array) {
    return (
      <>
        {objKey}:{" "}
        {objValue.value.map((i) => {
          return <strong>{i.description} </strong>;
        })}
      </>
    );
  }

  return (
    <>
      {objKey}: <strong>{objValue.value.description}</strong>
    </>
  );
};
