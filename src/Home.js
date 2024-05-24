import React from "react";
import { Link } from "react-router-dom";
function Home()
{
    return(
    
       
            <div style={{backgroundImage:'url(https://www.10wallpaper.com/wallpaper/1600x1200/1307/background_spots_patterns-Glare_abstract_HD_wallpaper_1600x1200.jpg)',height:'100vh'}}> this is my home Page
            this is my home Page
<div style={{color:'red',display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
    <div>
<h1 style={{paddingBottom:'89px'}}>this is home page</h1>
<br/>

<h2 style={{paddingBottom:'89px'}}>welcome to chat app</h2>


            <div>
                <Link to='/login'>
                    <button>
                        Enter
                    </button>
                </Link>
            </div>
            </div>
        </div>
        </div>
    )
}
export default Home;