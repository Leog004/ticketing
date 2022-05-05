import React, { useState } from "react";
import Router from "next/router";

import useRequest from "../../hooks/use-request";

export default function NewTicket() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title,
      price,
    },
    onSuccess: () => {
      Router.push("/");
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    doRequest();
  };

  const onBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
            type="text"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            onBlur={onBlur}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="form-control"
            type="text"
          />
        </div>
        {errors}
        <button className="btn btn-primary mt-4">Submit</button>
      </form>
    </div>
  );
}
