const images = ["Monha Niha", "Starry Night", "The Scream", "The Persistence of Memory", "The Birth of Venus"]

let currentPole = {
  lastbidder: "",
  lastbid: 0,
}

let connectedUsers: string[] = []

let startingPrice: any;

export function startBid(){
  currentPole.lastbid = 0
  currentPole.lastbidder = ""

  const randImage = images[Math.floor(Math.random() * images.length)]
  startingPrice = Math.floor(Math.random() * 1000) + 500

  return {
    image: randImage,
    startingPrice: startingPrice,
  }
}

export function takeBids(money: number, userId: string){
  console.log(startingPrice)
  if(money < startingPrice){
    console.log("no")
    return false
  }

  if(money > currentPole.lastbid){
    
    currentPole.lastbid = money
    currentPole.lastbidder = userId

    console.log(`New bid: ${money} from ${userId}`)
    return {
      lastBidder: currentPole.lastbidder,
      lastBid: currentPole.lastbid
    }
  } else {
    return false
  }
}

export function addUser(userId: string){
  connectedUsers.push(userId)
}

export function getUsers(){
  return connectedUsers
}

export function endBid(){
  console.log(`The winner is ${currentPole.lastbidder} with a bid of ${currentPole.lastbid}`)

  return {
    lastBidder: currentPole.lastbidder,
    lastBid: currentPole.lastbid
  }
}

export function getLastBid(){
  return {
    lastBidder: currentPole.lastbidder,
    lastBid: currentPole.lastbid.toString()
  }
}