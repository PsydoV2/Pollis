// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

struct Poll {
    uint pollID;
    string question;
    uint votesYes;
    uint votesNo;
    address creator;
    uint endsAt;
}

contract Pollis {
    mapping(uint => mapping(address => bool)) public hasVoted;
    Poll[] public polls;

    event Vote(uint pollID, address voter, bool voteYes);

    constructor() {
    }

    function createPoll(string calldata question, uint duration) public {
        polls.push(Poll({
            pollID: polls.length,
            question: question,
            votesYes: 0,
            votesNo: 0,
            creator: msg.sender,
            endsAt: block.timestamp + duration
        }));
    }

    function vote(uint pollID, bool voteYes) public {
        require(pollID < polls.length, "Poll does not exist!");
        
        Poll storage poll = polls[pollID];
                
        require(block.timestamp < poll.endsAt, "Poll has ended!");
        
        require(!hasVoted[pollID][msg.sender], "You can only vote once!");

        if (voteYes) {
            poll.votesYes++;
        } else {
            poll.votesNo++;
        }

        emit Vote(pollID, msg.sender, voteYes);

        hasVoted[pollID][msg.sender] = true;
    }

    function getPoll(uint pollID) public view returns (Poll memory) {
        require(pollID < polls.length, "Poll does not exist!");
        
        Poll storage poll = polls[pollID];

        return poll;
    }

    function getPollCount() public view returns (uint) {
        return polls.length;
    }
}