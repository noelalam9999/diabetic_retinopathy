import React, { useState } from "react";
import { TopNav } from "../LandingPage/TopNav/TopNav";
import { SubNav } from "../NavBar/SubNav/SubNav";
import { SearchBar } from "../SearchBar/SearchBar";
import styles1 from "./product.module.css";
import { ReviewPostButton, TextArea } from "./Form";
import { BrowseContent } from "../LandingPage/BrowseContent/BrowseContent";
import styles from "../LandingPage/LandingPage.module.css";
import LikeButtonDemo from "./reactButton";
import { BusinessRating } from "../BusinessRating/BusinessRating";
import { Link } from "react-router-dom";
import { useLazyQuery, gql } from "@apollo/client";
import { useQuery } from "@apollo/react-hooks";
import { useMutation } from "@apollo/react-hooks";
import { useAuth0 } from "@auth0/auth0-react";
import { Reviews } from "./Reviews";
import Typography from "@material-ui/core/Typography";
import { Product_suggestions } from "./product_suggestion";
import { RichText, Date } from "prismic-reactjs";
import { product_suggestions } from "./product_suggestion";
import { Timestamp } from "react-timestamp";
import { moment } from "moment";
import Footer from "../LandingPage/footer";
import Icon from "../LandingPage/icons";

const GET_PRODUCT = gql`
  query MyQuery($id: Int) {
    products(where: { Product_id: { _eq: $id } }) {
      Name
      Description
      Product_picture_link
      store_location_link
      status
      user {
        id
        name
      }
      reviews(where: { status: { _eq: true } }) {
        body
        status
        created_at
        user {
          id
          name
        }
      }
    }
  }
`;

const INSERT_REVIEW = gql`
  mutation MyMutation(
    $body: String!
    $product_id: Int
    $user_id: String!
    $moderator_id: String!
  ) {
    insert_review(
      objects: {
        body: $body
        product_id: $product_id
        user_id: $user_id
        moderator_id: $moderator_id
      }
    ) {
      affected_rows
    }
  }
`;

const FIND_MOD = gql`
  query {
    user(where: { user_type: { _eq: "moderator" } }) {
      id
    }
  }
`;
const CHANGE_MOD_STATUS = gql`
  mutation($id: String!) {
    update_user(where: { id: { _eq: $id } }, _set: { review_status: false }) {
      returning {
        product_status
      }
    }
  }
`;
const SEARCH = gql`
  query Search($match: String) {
    products(order_by: { Name: asc }, where: { Name: { _ilike: $match } }) {
      Name
      Description
      user {
        id
      }
    }
  }
`;

let current_mod = -1;
let total_mods = 0;

export function Product(props) {
  const [body, setReviewBody] = useState("");

  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [insert_review] = useMutation(INSERT_REVIEW);
  const [error2, setError] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [Search, { data1 }] = useLazyQuery(SEARCH);

  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { id: props.match.params.Product_id },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  let timestamp;
  {
    data.products.map((product, index) => (timestamp = product.created_at));
  }
  timestamp = Date(timestamp);

  timestamp = Intl.DateTimeFormat("en-US", {
    year: "numeric",

    month: "short",

    day: "2-digit",

    hour: "numeric",

    minute: "2-digit",

    second: "2-digit",
  }).format(timestamp);

  console.log(timestamp);
  return (
    <>
      <TopNav />
      <div className={styles1.searchBar}></div>
      <br />
      <div className={styles1.productInfoContainer}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            paddingTop: "20px",
            paddingLeft: "200px",
          }}
        >
          <ul className={styles1.styleinfo_productDescription}>
                  Your report results will be diplayed below in a few hours
                </ul>
          {data.products.map((product, index) => (
            <>
              <div className={styles1.styleinfo_productinfo}>

                



              </div>
            </>
          ))}

          <div className={styles1.styleinfo_productinfo2}>
            <ul className={styles1.menu_itemlist}></ul>
          </div>
        </div>
      </div>
      <div className={styles1.productInfoContainer2}>
        <div className={styles1.reviewPostBox}>
          {isAuthenticated && (
            <>
              {data.products.map((product, index) => (
                <></>
              ))}
            </>
          )}

          <ul className={styles1.boxTitle}></ul>
          <div className={styles1.reviewPanel}>
            {" "}
            {/* start for each loop from here for every individual review */}
            {/* {data.products.map((product, index) => (
              <>
                {product.reviews != null && (
                  <div key={index} className={styles1.ReviewBox}>
                    {product.reviews.map((review, index) => (
                      <>
                        <div className={styles1.reviewerDetailBox}>
                          <div className={styles1.reviewerImage}>
                            <img src="" className={styles1.userImageSmall} />
                          </div>

                          <div className={styles1.reviewerDetail}>
                            <div key={index}>
                              <ul className={styles1.reviewerName}>
                                {review.user.name}
                              </ul>

                              <div className={styles1.userReviewBox}>
                                {review.status == true && <ul> Approved</ul>}
                                {review.status == null && (
                                  <ul> Pending Approval</ul>
                                )}
                                {review.status == false && <ul> Declined</ul>}
                                <ul>
                                  <BusinessRating />
                                </ul>
                                <ul className={styles1.reviewDate}></ul>
                                <ul>{review.body}</ul>
                                <div>
                                  <LikeButtonDemo />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                  </div>
                )}
              </>
            ))} */}
          </div>
        </div>
        {/* <div className={styles1.suggestionContainer}>
          <ul className={styles1.boxTitle}>You May Also Consider</ul>
          <div className={styles1.suggestionPanel}>
            <Product_suggestions props={props.match.params.Product_id} />
            <Product_suggestions props={props.match.params.Product_id} />
          </div>
        </div> */}
      </div>

      
    </>
  );
}

export default Product;
