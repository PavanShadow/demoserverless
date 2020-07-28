"use strict";

const AWS = require("aws-sdk");

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
  const data = JSON.parse(event.body);

  // validation
  if (typeof data.userId !== "string") {
    console.error("Validation Failed");
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: "Couldn't update the todo item.",
    });
    return;
  }

  const params = {
    TableName: USERS_TABLE,
    Key: {
      id: event.pathParameters.userId,
    },

    ExpressionAttributeValues: {
      ":name": data.name,
      ":department": data.department,
    },
    UpdateExpression: "SET name = :name, department = :department",
    ReturnValues: "ALL_NEW",
  };

  // update the todo in the database
  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { "Content-Type": "text/plain" },
        body: "Couldn't fetch the todo item.",
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};
