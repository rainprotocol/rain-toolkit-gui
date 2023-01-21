import { createClient } from "@urql/svelte";
import { derived, writable } from "svelte/store";
import { networks } from "./constants";


export const selectedNetwork = writable(networks[1]);
export const client = derived(
  selectedNetwork,
  $selectedNetwork => createClient({
    //Main
    // url: "https://api.thegraph.com/subgraphs/name/siddharth2207/orderbook"
    
    //Dev
    // url: "https://api.thegraph.com/subgraphs/name/siddharth2207/orderbookdevelop"
    url: "https://api.thegraph.com/subgraphs/name/siddharth2207/obdevelop"
  })
)
