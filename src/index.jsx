import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
  gql,
} from "@apollo/client";
import Pusher from "pusher-js";
import PusherLink from "graphql-ruby-client/subscriptions/PusherLink";

// Prepare test Pusher App
// See: https://dashboard.pusher.com/apps/:app_id/keys
const PUSHER_KEY = "PUSHER_KEY";
const PUSHER_CLUSTER = "PUSHER_CLUSTER";

const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
const pusherLink = new PusherLink({ pusher });

const httpLink = createHttpLink({
  uri: `http://localhost/graphql`,
  // return test data instead of requesting actually
  // See: https://www.apollographql.com/docs/react/api/link/apollo-link-http/#fetch
  fetch: (...req) => {
    console.log(req);

    const body = JSON.stringify({ data: {} });
    const headers = new Headers({
      "X-Subscription-ID": "test-subscription-id",
    });

    return Promise.resolve(new Response(body, { headers }));
  },
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([pusherLink, httpLink]),
});

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const POST_WAS_PUBLISHED = gql`
      subscription {
        postWasPublished {
          body
        }
      }
    `;

    const subscription = client
      .subscribe({
        query: POST_WAS_PUBLISHED,
      })
      .subscribe({
        next: (event) => {
          console.log("event", event);
          setEvents((events) => [...events, JSON.stringify(event)]);
        },
        error: (error) => console.log("error", error),
        complete: () => console.log("complete"),
      });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <h1>Events:</h1>
      <pre>{events.join("\n")}</pre>
    </>
  );
}

render(<App />, document.getElementById("root"));
