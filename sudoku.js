
/* 
    Following is Class to solve sudoku.
    
    Example to Use the Class
        let sudoku = new Sudoku();
        let solvedSudoku=sudoku.solve([   
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ]);
        console.log(solvedSudoku)

    Verified Test Cases
        node sudoku.js

        INPUT
        [[5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]]

        OUTPUT
        [[5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]]

*/
function Sudoku(){
    /**
     * Main Function to solve the sudoku, 
     * It finds the zeroIndices and keeps looping till all zeros are filled.
     * It also checks if any iteration has not filled zeros, if not, throws error
     * Once solved, it verifies the authencity of the solution
    */
    this.solve=(board)=>{
        try{
            this.board=board;
            this._findZeroIndices();
            this._transposeBoard();
            while(this._zeroCoordinates.length>0){
                if(!this._solveForOneIteration()){
                    throw `This sudoku has no defeinitive solution! Remaining ${this._zeroCoordinates.length} positions`
                }
            }
            if(this._verify()){
                return this.board;
            }
            else{
                throw `The solution was improper`
            }
        }
        catch(e){
            console.error("Error while solving sudoku",e);
        }
        
    }

    /**
     * Internal Function to verify solved sudoku's authenticity
     * It sums all the rows, cols and nonets and checks if all sums up to 45.
     */
    this._verify=()=>{
        for(let boardRow of this.board){
            if(boardRow.reduce((acc, curr) => acc + curr, 0)!=45){
                return false;
            }
        }
        for(let boardCol of this._transposedBoard){
            if(boardCol.reduce((acc, curr) => acc + curr, 0)!=45){
                return false;
            }
        }
        let nonetIndices=[0,3,6];
        for(let startRowIndex of nonetIndices){
            for(let startColumnIndex of nonetIndices){
                let nonetArray=[]
                let tempBoard=JSON.parse(JSON.stringify(this.board));
                tempBoard.splice(startRowIndex,3).forEach((nonetRow)=>nonetArray=nonetArray.concat(nonetRow.splice(startColumnIndex,3)));
                if(nonetArray.reduce((acc, curr) => acc + curr, 0)!=45){
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Internal Function to solve sudoku for one interation.
     * It calls checks all the zero coordinates and returns true if any of them is filled.
     */
    this._solveForOneIteration=()=>{
        for(let zeroCoordinateIdx in this._zeroCoordinates){
            if(this._solveForACoordinate(zeroCoordinateIdx)){
                return true;
            }
        }
        return false;
    }

    /**
     * Internal Function to find solution for a single coordinate.
     * Uses presence Map to keep track of the elements found. Map also ensure that the values are unique.
     * (Map saves from the cost overhead of finding unique datapoints from a list)
     * Checks rows, cols and nonents for possibilities of numbers and fills up a zero if there is one definitive possibility
     * Returns true if has filled a zero
     */
    this._solveForACoordinate=(zeroCoordinateIdx)=>{
        let presenceMap={
            1:false,
            2:false,
            3:false,
            4:false,
            5:false,
            6:false,
            7:false,
            8:false,
            9:false
        }
        presenceMap=this._findRowPossibilities(zeroCoordinateIdx,presenceMap);
        presenceMap=this._findColumnPossibilities(zeroCoordinateIdx,presenceMap);
        presenceMap=this._findNonetPossibilities(zeroCoordinateIdx,presenceMap);
        let possibilities=Object.values(presenceMap).map((flag,index)=>flag?null:index+1).filter(val=>val);
        if(possibilities.length==1){
            let zeroCoordinate=this._zeroCoordinates[zeroCoordinateIdx];
            let rowIndex=zeroCoordinate[0];
            let colIndex=zeroCoordinate[1];
            this.board[rowIndex][colIndex]=possibilities[0];
            this._transposedBoard[colIndex][rowIndex]=possibilities[0]
            this._zeroCoordinates.splice(zeroCoordinateIdx, 1)
            return true;
        }
        return false;
    }

    /**
     * Internal Function which populates presence map basis availibility in the row
     */
    this._findRowPossibilities=(zeroCoordinateIdx,presenceMap)=>{
        let rowIndex=this._zeroCoordinates[zeroCoordinateIdx][0];
        this.board[rowIndex].forEach((val)=>{
            if(val!=0){
                presenceMap[val]=true
            }
        })
        return presenceMap;
    }

    /**
    * Internal Function which populates presence map basis availibility in the col
    */
    this._findColumnPossibilities=(zeroCoordinateIdx,presenceMap)=>{
        let colIndex=this._zeroCoordinates[zeroCoordinateIdx][1];
        this._transposedBoard[colIndex].forEach((val)=>{
            if(val!=0){
                presenceMap[val]=true
            }
        })
        return presenceMap;
    }

    /**
    * Internal Function which populates presence map basis availibility in the nonet
    */
    this._findNonetPossibilities=(zeroCoordinateIdx,presenceMap)=>{
        let rowIndex=this._zeroCoordinates[zeroCoordinateIdx][0];
        let colIndex=this._zeroCoordinates[zeroCoordinateIdx][1];
        let startRowIndex=parseInt(rowIndex/3)*3;
        let startColumnIndex=parseInt(colIndex/3)*3;
        let nonetArray=[]
        let tempBoard=JSON.parse(JSON.stringify(this.board));
        tempBoard.splice(startRowIndex,3).forEach((nonetRow)=>nonetArray=nonetArray.concat(nonetRow.splice(startColumnIndex,3)));
        nonetArray.forEach((val)=>{
            if(val!=0){
                presenceMap[val]=true
            }
        })
        return presenceMap;
    }

    /**
    * Internal Function which finds all the different coordinates where the board is zero
    */
    this._findZeroIndices=()=>{
        this._zeroCoordinates=[]
        this.board.forEach((row,rowIndex)=>row.forEach((val,colIndex)=>{
            if(val==0){
                this._zeroCoordinates.push([rowIndex,colIndex])
            }
        }));
    }

    /**
    * Internal Function which transposes the board. (It helps in col calculations)
    */
    this._transposeBoard=()=>this._transposedBoard=this.board[0].map((col, i) => this.board.map(row => row[i]));
}


/*
    Running the algorithm down below.
*/
let sudoku = new Sudoku();
let solvedSudoku=sudoku.solve([   
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
]);
console.log(solvedSudoku);

