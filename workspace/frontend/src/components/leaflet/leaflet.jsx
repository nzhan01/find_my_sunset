/* eslint-disable react/prop-types -- project does not use PropTypes elsewhere */
import { MapContainer, TileLayer, Marker, Popup,useMapEvents,  } from 'react-leaflet'
import {useState, } from "react";
import './leaflet.css'
import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix for missing marker icons on production build
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})



{/*
This is the main component of the leaflet Map

On click of a position on the map, the sunset/sunrise times is fetched,
then the gemini response, then all this information is added to the backend db

Finally, this information is displayed in a popup on the map

*/}


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Spinner = () => <div className="spinner"></div>;

//function to create a popup wherever the user clicks on the map
//defined outside Leaflet so its identity is stable across parent re-renders;
//otherwise every setState in the click handler redefines this component,
//causing React to remount the Marker/Popup and lose the open popup state
function LocationMarker({ position, setPosition, sunInfo, setSunInfo, geminiOutput, setGeminiOutput, isLoading, setIsLoading }) {


    // click event
        const map = useMapEvents({
            click  (e) {
                // initialze constants with coords
                const lat = e.latlng.lat
                const lng = e.latlng.lng
                setPosition(e.latlng)
                map.flyTo(e.latlng, map.getZoom())
                setIsLoading(true);

                // post request to get sunrise times
                fetch(`${API_BASE_URL}/sunrise-sunset`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userInput: {
                            latitude: lat,
                            longitude: lng
                        }
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        setSunInfo(data.message)        //update sun info
                        console.log("setting sunInfo useState to ",data.message)
                        const GeminiInput = `lat: ${lat},lng: ${lng} Sunrise & Sunset times ${data.message}`
                        const suntimes = data.message   // variable to be used for gemini



                        fetch(`${API_BASE_URL}/chat`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({userInput: GeminiInput})
                        })
                            .then(res => res.json())
                            .then(data => {
                                setGeminiOutput(data.message)
                                console.log("setting sunInfo useState to ",data.message)
                                setIsLoading(false);

                                // add log to backend db
                                fetch(`${API_BASE_URL}/add`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'

                                    },
                                    body: JSON.stringify({input:
                                            {
                                            latitude: lat,
                                            longitude: lng,
                                            suntimes: suntimes,
                                                gemini: data.message
                                            }
                                    })
                                })
                                .then(res => res.json())
                                .then(data => {
                                    console.log("adding new data: ",data.message)
                                })
                                .catch(err => {
                                    console.error("Error while posting to /add route:", err);
                                });






                            })
                            .catch(err => {
                                console.error("Gemini error:", err)
                                setGeminiOutput("error getting gemini results")
                                setIsLoading(false);

                            })


                    })
                    .catch(err => {
                        console.error("API error:", err)
                        setSunInfo(["Error fetching sun times","Error fetching sun times"])
                        setIsLoading(false);
                    })




            //click { close
            }




         //mapevent ({ close
        })


        // marker information
        return position === null ? null : (

            <Marker position={position}>
                <Popup>
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <>
                            <div className="popup-header">
                                <strong>You are here at position:</strong>
                                <div className="popup-coords">
                                    Latitude: {position.lat.toFixed(4)}<br/>
                                    Longitude: {position.lng.toFixed(4)}
                                </div>
                            </div>
                            <div className="popup-suntimes">
                                <span>🌅 Sunrise: {new Date(sunInfo[0]).toLocaleTimeString()}</span>
                                <span>🌇 Sunset: {new Date(sunInfo[1]).toLocaleTimeString()}</span>
                            </div>
                            <p className="gemini-box"><strong>Similar Sunset Location:</strong><br/>{geminiOutput}</p>
                        </>
                    )}
                </Popup>
            </Marker>
        )
    }


export default function Leaflet() {
    const [position, setPosition] = useState(null)                  //latlang coords of marker
    const [sunInfo, setSunInfo] = useState(["", ""])        //sunrise/sunset times
    const [geminiOutput, setGeminiOutput] = useState("");     // other location given by gemini
    const [isLoading, setIsLoading] = useState(false);

    return (
            <div id='leafletContainer'>


            <h1>Click on your marker to get sunset information!</h1>
            <div id="map">
                <MapContainer center={[42.345, -71.103]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={[61.5937, -149.1246]}>
                        <Popup>
                            If you live here, you&#39;re awesome
                        </Popup>
                    </Marker>
                    <Marker position={[42.345, -71.103]}>
                        <Popup>
                            This is where I&#39;m from!
                        </Popup>
                    </Marker>
                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        sunInfo={sunInfo}
                        setSunInfo={setSunInfo}
                        geminiOutput={geminiOutput}
                        setGeminiOutput={setGeminiOutput}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                    />
                </MapContainer>
            </div>
            </div>
    )
}