import React, { useState } from "react";
import { TopNav } from "../LandingPage/TopNav/TopNav";
import { SubNav } from "../NavBar/SubNav/SubNav";
import { useMutation } from "@apollo/react-hooks";
import { useLazyQuery, gql } from "@apollo/client";
import { Label ,TextArea, Input_price, Input_title, Input } from "./Form";
import { BrowseContent } from "../LandingPage/BrowseContent/BrowseContent";
import styles from "../LandingPage/LandingPage.module.css";
import FileUpload from "./Fileupload";
import Axios from "axios";
import { useQuery } from "@apollo/react-hooks";
import { useAuth0 } from "@auth0/auth0-react";
import { withApollo } from "@apollo/react-hoc";
import { useHistory } from "react-router-dom";
import { ActionSearch } from "material-ui/svg-icons";
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from "../LandingPage/icons";
import Footer from "../LandingPage/footer";
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const INSERT_PRODUCT_MOD = gql`
  mutation(
    $name: String!
    $description: String!
    $userId: String!
    $moderator_id: String!
    $Link: String!
    $Link1: String!
  ) {
    insert_products(
      objects: [
        {
          Name: $name
          Description: $description
          user_id: $userId
          moderator_id: $moderator_id
          store_location_link: $Link
          Product_picture_link: $Link1
        }
      ]
    ) {
      affected_rows
    }
  }
`;

const INSERT_PRODUCT = gql`
  mutation(
    $name: String!
    $description: String!
    $userId: String!
    $Link: String!
  ) {
    insert_products(
      objects: [
        {
          Name: $name
          Description: $description
          user_id: $userId
          store_location_link: $Link
        }
      ]
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
    update_user(where: { id: { _eq: $id } }, _set: { product_status: false }) {
      returning {
        product_status
      }
    }
  }
`;
const PRODUCT_ID = gql`
  query MyQuery {
    products(order_by: { Product_id: desc }, limit: 1) {
      Product_id
    }
  }
`;

let current_mod = -1;
let total_mods = 0;

const Continents = [
  { key: 1, value: "Dhaka" },
  { key: 2, value: "Chittagong" },
  { key: 3, value: "Khulna" },
  { key: 4, value: "Sylhet" },
  { key: 5, value: "Barishal" },
  { key: 6, value: "Rajshahi" },
  { key: 7, value: "Rangpur" },
];
export function Product_upload(props) {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  // const [Images, setImages] = useState([])
  const [image, setImage] = useState("");
  const history = useHistory();
  // const {user} = useAuth0();
  const [name, setTitleValue] = useState("");
  const [description, setDescriptionValue] = useState("");
  const [Link, setLinkValue] = useState("");
  const [PriceValue, setPriceValue] = useState(0);
  const [ContinentValue, setContinentValue] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // const [moderator_id, setModeratorId] = useState(1);

  // const updateImages = (newImages) => {
  //     setImages(newImages)
  // }
  const uploadImage = async (e) => {
    const files = e.target.files;
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", "konta-productimg");
    setLoading(true);
    const res = await fetch(
      "	https://api.cloudinary.com/v1_1/dr1xdii7w/image/upload",
      {
        method: "POST",
        body: data,
      }
    );
    const file = await res.json();

    setImage(file.secure_url);
    setLoading(false);
  };

  const onTitleChange = (e) => {
    setTitleValue(e.target.value);
  };
  const onDescriptionChange = (e) => {
    setDescriptionValue(e.target.value);
  };
  const onPriceChange = (e) => {
    setPriceValue(e.target.value);
  };
  const onContinentsSelectChange = (e) => {
    setContinentValue(e.currentTarget.value);
  };
  const [insert_product] = useMutation(INSERT_PRODUCT);
  const [insert_product_mod] = useMutation(INSERT_PRODUCT_MOD);

  const [change_mod_status] = useMutation(CHANGE_MOD_STATUS);

  const { data } = useQuery(FIND_MOD);
  const product_id = useQuery(PRODUCT_ID);
  // if (loading1) return "Loading...";
  // if (error1) return `Error! ${error.message}`;

  // console.log(product_id)
  if (loading) return <p>Loading ...</p>;
  if (error) return <p>Error :(</p>;

  const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };
  const onSubmit = (e) => {
    e.preventDefault();

    if (!name || !description || !image) {
      return alert("fill all the mandatory fields first!");
    }



    let mod_id = new Array();
    {
      data.user.map(({ id }, index) => (mod_id[index] = id));
    }
    console.log(total_mods);
    total_mods = mod_id.length;

    const unassigned = "unassigned";
    if (current_mod < total_mods) {
      current_mod++;
    } else {
      current_mod = 0;
    }

    insert_product_mod({
        variables : {name, description, userId:props.match.params.id,moderator_id: mod_id[current_mod],Link:Link,Link1:image }
  

    }).catch(function(error){
        console.log(error);
        setError(error.toString());
    });
   

    setDescriptionValue("");
    setTitleValue("");
  };
  async function Redirect() {
    await sleep(5000);
    let product_id_var;
    product_id.data.products.map(
      ({ Product_id }) => (product_id_var = Product_id + 1)
    );
    history.push("/user/" + props.match.params.id);
  }
  return (
    <>
    <TopNav />
      {isAuthenticated && (
        <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <Label> Upload </Label>
          </div>

          <form
            onSubmit={(e) => {
              onSubmit(e);
              Redirect();
            }}
          >
            {/* <FileUpload refreshFunction={updateImages} /> */}
            <Grid container spacing={0}>
              <Grid item xs={6}>
                <div style={{ display: "flex",flexDirection:"column-reverse" ,alignItems: "center" }}>
                  {/* <FontAwesomeIcon icon="plus-circle" style={{fontSize: "5rem"}} onClick={uploadImage}/> */}
                  <span>
                    {" "}
                    <Button variant="contained" component="label" style={{marginTop:"20px"}}>
                        Choose Image
                    <input
                      style={{}}
                      type="file"
                      name="file"
                      hidden
                      onChange={uploadImage}
                    />
                    </Button>
                  </span>
                  {loading ? (
                    <h3>Loading...</h3>
                  ) : (
                    <img src={image} style={{ width: "250px", height: "320px" }} />
                  )}
                </div>
              </Grid>
{/* 
            <br />
            <label style={{ fontSize: "20px" }}>Name </label>
            <Input_title
              onChange={(e) => setTitleValue(e.target.value)}
              value={name}
              type="text"
            />

            <label style={{ fontSize: "20px" }}>Age</label>
            <TextField
              style={{ margin: "1rem 0" }}
              onChange={(e) => setDescriptionValue(e.target.value)}
              value={description}
              type="text"
            /> */}
              <Grid item xs={6}>
                <Grid container>
                  <Grid item xs={12}>
                    <br />
                    <TextField id="name-txtfld" label="Name" variant="outlined" onChange={(e) => setTitleValue(e.target.value)}
                      value={name} />
                  </Grid>
                  <Grid item xs={12}>
                    <br />
                    <br />
                    <TextField id="age-txtfld" label="Age" variant="outlined" onChange={(e) => setDescriptionValue(e.target.value)}
                      value={description}/>

                    <br />
                  </Grid>
                </Grid>  
              </Grid>
            <Input type="submit" value="Upload" />
            {/* <Button variant="contained" color="primary" component="span" type="submit" value="Submit"  style={{marginTop:"40px"}}>
              Upload
            </Button> */}
          </Grid>
          </form>
        </div>
      )}

      <div className={styles.landing4}>
        <div className={styles["font"]}>
          
        </div>
      </div>
      <Footer style={{padding:"20px"}}>
        <Footer.Wrapper>
          <Footer.Row>
            <Footer.Column>
              <Footer.Title>About Us</Footer.Title>
              <Footer.Link href="#">Story</Footer.Link>
              <Footer.Link href="#">Clients</Footer.Link>
              <Footer.Link href="#">Testimonials</Footer.Link>
            </Footer.Column>
            <Footer.Column>
              <Footer.Title>Services</Footer.Title>
              <Footer.Link href="#">Marketing</Footer.Link>
              <Footer.Link href="#">Consulting</Footer.Link>
              <Footer.Link href="#">Development</Footer.Link>
              <Footer.Link href="#">Design</Footer.Link>
            </Footer.Column>
            <Footer.Column>
              <Footer.Title>Contact Us</Footer.Title>
              <Footer.Link href="#">United States</Footer.Link>
              <Footer.Link href="#">United Kingdom</Footer.Link>
              <Footer.Link href="#">Australia</Footer.Link>
              <Footer.Link href="#">Support</Footer.Link>
            </Footer.Column>
            <Footer.Column>
              <Footer.Title>Social</Footer.Title>
              <Footer.Link href="#">
                <Icon className="fab fa-facebook-f" />
                Facebook
              </Footer.Link>
              <Footer.Link href="#">
                <Icon className="fab fa-instagram" />
                Instagram
              </Footer.Link>
              <Footer.Link href="#">
                <Icon className="fab fa-youtube" />
                Youtube
              </Footer.Link>
              <Footer.Link href="#">
                <Icon className="fab fa-twitter" />
                Twitter
              </Footer.Link>
            </Footer.Column>
          </Footer.Row>
        </Footer.Wrapper>
      </Footer>
    </>
  );
}

export default withApollo(Product_upload);
