import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import _ from "lodash";

import "App/App.scss";
import NiceButton from "nice-button/nice-button";

const cardShape = PropTypes.shape({
  cardId: PropTypes.string.isRequired,
  suit: PropTypes.oneOf(["red", "blue", "green", "yellow", "rocket"])
    .isRequired,
  number: PropTypes.number.isRequired,
});

const getCardId = ({ suit, number }) => `${suit}_${number}`;

const getInitialCards = () => {
  const cards = {};
  _.each(["red", "green", "blue", "yellow", "rocket"], (suit) => {
    const maxNumber = suit === "rocket" ? 4 : 9;
    _.each(_.range(1, maxNumber + 1), (number) => {
      const cardId = getCardId({ suit, number });
      const cardObj = {
        cardId,
        suit,
        number,
        wasPlayed: false,
      };
      cards[cardId] = cardObj;
    });
  });
  return cards;
};

class Card extends Component {
  static propTypes = {
    card: cardShape.isRequired,
    setCardState: PropTypes.func.isRequired,
  };

  render() {
    const cardClasses = classNames("card", this.props.card.suit, {
      "was-played": this.props.card.wasPlayed,
    });
    return (
      <div className={cardClasses} onClick={this.onClickCard}>
        <div className="card-inner">{this.props.card.number}</div>
      </div>
    );
  }

  /* Helpers. */

  onClickCard = (evt) => {
    const updatedCard = {
      ...this.props.card,
      wasPlayed: !this.props.card.wasPlayed,
    };
    this.props.setCardState(updatedCard);
  };
}

class Suit extends Component {
  static propTypes = {
    cards: PropTypes.objectOf(cardShape).isRequired,
    setCardState: PropTypes.func.isRequired,
  };

  render() {
    const availableCards = _.map(
      _.sortBy(_.pickBy(this.props.cards, { wasPlayed: false }), "number"),
      (card) => (
        <Card
          card={card}
          setCardState={this.props.setCardState}
          key={card.cardId}
        />
      )
    );
    const playedCards = _.map(
      _.sortBy(_.pickBy(this.props.cards, { wasPlayed: true }), "number"),
      (card) => (
        <Card
          card={card}
          setCardState={this.props.setCardState}
          key={card.cardId}
        />
      )
    );
    return (
      <div className="suit">
        <div className="suit-available">{availableCards}</div>
        <div className="vertical-bar"></div>
        <div className="suit-played">{playedCards}</div>
      </div>
    );
  }
}

class App extends Component {
  state = {
    cards: getInitialCards(),
  };

  render() {
    const suits = _.uniq(_.map(_.values(this.state.cards), "suit"));

    const suitRows = _.map(suits, (suit) => {
      const cards = _.pickBy(this.state.cards, { suit });
      return <Suit cards={cards} setCardState={this.setCardState} key={suit} />;
    });

    const noCardsChanged = _.isEqual(this.state.cards, getInitialCards());

    return (
      <div className="App">
        {suitRows}
        <div className="button-row">
          <NiceButton
            isPrimary={true}
            onClick={this.onClickReset}
            isDisabled={noCardsChanged}
          >
            Reset Cards
          </NiceButton>
        </div>
      </div>
    );
  }

  /* Helpers. */

  setCardState = (updatedCard) => {
    const { cardId } = updatedCard;
    const newCards = {
      ...this.state.cards,
      [cardId]: updatedCard,
    };
    this.setState({ cards: newCards });
  };

  onClickReset = (evt) => {
    this.setState({ cards: getInitialCards() });
  };
}

export default App;
