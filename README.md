# One Way Linking Trello Power Up

This power up allows you to create one way links between lists and boards. This means that, if you link two lists or one board and one list together, new cards added to the source list/board will be added to the target list. It is one way, because cards added to the target list, will not be copied to the source list.

All cards show a tag, that show which board it was copied from, and maintain a two  way link to the original card. This means that changes made to either the original or the copy card will be synced witch eachother.

## **Capabilities:** ##

* ### **One way linking** ###
    * **Create a link between lists** 
        * All cards that have been added to the target list, and fullfill the defined condition will copied over to the target list
        * ![image1](/images/ListLink.png)
    * **Create a link between list and board**
        * All cards that have been added to the target board, and fullfill the defined condition will copied over to the target list
        * ![image1](/images/BoardLink.png)

* ### **Two way linking cards** ###
    * **All copied cards are automatically linked** 
        * All cards that have been copied by the power up are linked with their source card.
    * **Periodic syncs between the cards**
        * All cards are synced, and both the changes of the original card and the link card will be copied and saved to each other
        * If the any of the cards are moved to a list that has a link, it will move the linked card, to the counterpart list.
        * ![image1](/images/CardLink.png)
