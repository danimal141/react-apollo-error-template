import { ApolloLink, createHttpLink } from "@apollo/client";
import Pusher from "pusher-js";
import PusherLink from "graphql-ruby-client/subscriptions/PusherLink";

const httpLink = createHttpLink({ uri: `https://api.github.com/graphql` });
const pusher = new Pusher("APP_KEY", { cluster: "APP_CLUSTER" });
const pusherLink = new PusherLink({ pusher: pusher });

// `onError` in `useQuery` callback is not invoked
export default ApolloLink.from([pusherLink, httpLink]);

// `onError` in `useQuery` callback is invoked correctly
// export default ApolloLink.from([httpLink]);
