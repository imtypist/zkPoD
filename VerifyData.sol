// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract VerifyData {
    
    function verify(uint[] memory input) 
        public
        pure
        returns (bool[] memory) 
    {
        uint sigma = 1;
        uint HALF_WINDOW_SIZE = 2;
        uint WINDOW_SIZE = 5;
        bool[] memory output = new bool[](input.length);
        for (uint i = 0; i < output.length; i++)
            output[i] = true;

        for (uint i = 2; i < input.length - 2; i++) {
            uint[5] memory findMedian = [input[i-2],input[i-1],input[i],input[i+1],input[i+2]];
            for (uint j = 0; j < WINDOW_SIZE - 2; j++) {
                for (uint k = j + 1; k < WINDOW_SIZE - 1; k++) {
                    uint temp = findMedian[j];
                    if (findMedian[j] >= findMedian[k]) {
                        findMedian[j] = findMedian[k];
                        findMedian[k] = temp;
                    }
                }
            }
            uint median = findMedian[HALF_WINDOW_SIZE];
            if ((median - sigma) > input[i] || (median + sigma < input[i])) {
                output[i] = false;
            }
        }
        return output;
    }
}