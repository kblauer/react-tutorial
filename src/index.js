import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// class component for Square
/*class Square extends React.Component {
    render() {
        return (
            <button
                className="square"
                onClick={() => this.props.onClick()}
            >
                {this.props.value}
            </button>
        );
    }
}*/

function Square(props) {
    let classStr = "square";
    if (props.winSquare) {
        classStr += " winSquare";
    }
    return (
        <button
            className={classStr}
            onClick={props.onClick}>
            {props.value}
        </button>
    )
}

class Board extends React.Component {
/*    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            xIsNext: true,
        };
    }*/

/*    handleClick(i) {
        const squares = this.state.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            squares: squares,
            xIsNext: !this.state.xIsNext,
        });
    }*/

    renderSquare(i) {
        let winSquare = false;
        if (this.props.winnerSquares && this.props.winnerSquares.includes(i)) {
            winSquare = true;
        }

        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                winSquare={winSquare}
            />
        );
    }

    render() {
        const numRows = 3;
        const numCols = 3;

        // [...Array(x)] creates an array of size x filled with undefined, same as
        // Array(x).fill(undefined)
        return (
            <div>
                {[...Array(numRows)].map((row, rowId) =>
                    <div className="board-row" key={rowId}>
                        {[...Array(numCols)].map((col, colId) =>
                            this.renderSquare((rowId*3) + colId)
                        )}
                    </div>
                )}
            </div>
        );

        //return boardJsx;
        /*return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );*/
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            chosenSquares: Array(9),
            stepNumber: 0,
            lastSquare: null,
            xIsNext: true,
            sortDirectionReversed: false,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        //const history = this.state.history;
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        // quit out if someone has won or clicking a square that's already chosen
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';

        const chosenSquares = this.state.chosenSquares.slice(0, this.state.stepNumber + 1);
        chosenSquares[this.state.stepNumber] = i;

        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            lastSquare: i,
            chosenSquares: chosenSquares,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
           stepNumber: step,
           xIsNext: (step % 2) === 0,
        });
    }

    toggleSortDirection() {
        this.setState({
            sortDirectionReversed: !this.state.sortDirectionReversed,
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        // this doesn't work b/c state of last square updates, and therefore
        // when re-rendered it takes the current value of lastSquare every time
        //const thisColRowStr = convertColRow(this.state.lastSquare);

        const moves = history.map((step, move) => {

            let colRowStr;
            if (move > 0) {
                colRowStr = convertColRow(this.state.chosenSquares[move-1]);
            }

            let isCurrentMove = false;
            if (move === this.state.stepNumber) isCurrentMove = true;
            const currentMoveClass = isCurrentMove ? 'isCurrentMove' : '';

            const desc = move ?
               'Go to move #' + move + ' ' + colRowStr :
               'Go to game start';

            return (
                <li key={move} className={currentMoveClass}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });
        if (this.state.sortDirectionReversed) {
            moves.reverse();
        }

        const sortDirectionToggle = <button
            onClick={() => this.toggleSortDirection()}>
            Toggle Sort Direction
        </button>;

        let status;
        // game is draw only if no winner and both history and step number are max
        let draw = !winner && history.length === 10 && this.state.stepNumber === 9;
        if (winner) {
            status = 'Winner!: ' + winner[0];
        } else if (draw) {
            status = 'Draw!';
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }


        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winnerSquares={winner && winner[1]}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>{sortDirectionToggle}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// helper function for calculating game winner
// @return null if no winner
// @return [winner, lineToWin] if winner
// winner = 'X' or 'O'
// lineToWin = [0,1,2] array of 3 cells filled to win
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return [squares[a], lines[i]];
        }
    }
    return null;
}

// helper function for getting (col, row) from square index
// @return '(col, row)'
// col = column value of index
// row = row value of index
function convertColRow(i) {
    let col;
    let row;
    if (i<3) {
        col = 0;
        row = i;
    } else if (i<6) {
        col = 1;
        row = i-3;
    } else {
        col = 2;
        row = i-6;
    }

    return "(" + col + ", " + row + ")";
    //return colRowStr;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);