import React from 'react';
let url = 'https://species-sf5lnbi2xa-uc.a.run.app';

function CreateTable(props){
    let head_elements = props.my_header.map( (header, index)=>{
        return <th key={index}>{ header }</th>
    })

    let row_elements = props.my_table.map((row, index)=>{
        return <tr key={index}>{ row.map((item, i)=>{
            return <td key={i}>{ item }</td>
        })}</tr>
    })
    return <>
    <thead><tr>{head_elements}</tr></thead>
    <tbody>{row_elements}</tbody>
    </>
}

class Content extends React.Component{

  constructor(props){
    super(props);
    this.state = {column_list : [], my_table:[], sub_table:null,
        conservation_status_list:[], category_list:[], show_table:true}
  }

    componentDidMount(){
        const reqOptions = {
            method:'GET',
            headers: { 'Content-Type': 'application/json'}
        }

        // fetch the columns of data table from api on component initial mount
        fetch(url+'/get_column_names', reqOptions).then((response)=>{
           
            return response.json()
        }).then((data) => {
            this.setState((state)=>{
                return {
                    column_list: data[0], category_list: data[1],
                    conservation_status_list: data[2]
                }
            });

            return fetch(url+'/', reqOptions)
        }).then((response)=>{
            
            return response.json()
        }).then((data)=>{
            // create the table from fetched table data
            this.setState(()=>{
                return {my_table: Array.from(JSON.parse(data))}
            });        
        })
        .catch(err => {
            console.log(' Encountered error requesting columns');
        })

    }

    req_sublist(){

        // values used as filters for table
        let cat = document.getElementById('category_val').value !== '' ? document.getElementById('category_val').value : 'null';
        let con = document.getElementById('conservation_val').value !== '' ? document.getElementById('conservation_val').value : 'null';
        if(cat === 'null' && con === 'null'){
            console.log(" Empty parameters ");
            return;
        }
        const reqOptions = {
            method:'GET',
            headers: { 'Content-Type': 'application/json',
            'Access-Control-Allow-Origin':''}
        }
        
        fetch(`${url}/sub_table/${cat}/${con}`).then((response)=>{
            console.log("sub list response ", response);
            return response.json()
        }).then((data)=>{
            console.log("sub list response ", data);
            this.setState(()=>{
                return {sub_table: Array.from(JSON.parse(data)),
                show_table: false}
            });

            return fetch(url+'/plot', reqOptions)
        }).then((response)=>{
            console.log('finished fetching image data ', response);
            return response.blob()
        }).then((image)=>{
            // reset graph image
            document.getElementById('curr_img').src = url+'/plot'; //URL.createObjectURL(image);
        }).catch((err) => {
            console.log("error retrieving sublist " );
        })

    }

    show_entire_table(){
        this.setState(()=>{
            return {show_table: true}

        })
        document.getElementById('curr_img').src = url+'/image';
    }

    render(){

        let category_options = this.state.category_list.map((item, index)=>{
        return <option key={index}>
            {item}
            </option>
        });
        
        let conservation_options = this.state.conservation_status_list.map((item, index)=>{
        return <option key={index}>
            {item}
            </option>
        });
        
        let Table;
        if(this.state.show_table === true)
            Table = this.state.my_table;
        else 
            Table = this.state.sub_table;

        return (
        <>
            <section className="table_section">
                <table className="my_table">
                <CreateTable className='table_content' my_table={Table} 
                my_header={this.state.column_list} />
                </table>
            </section>

            <section className="selection_menu">
                <select id='category_val' className='selection'>
                    <option value=''>Select Category</option>
                    { category_options }
                </select>
                <select id='conservation_val' className='selection'>
                    <option value=''>Select Conservation</option>
                    { conservation_options }
                </select>
                <button className='selection' onClick={this.req_sublist.bind(this)}> Set Parameters </button>
                <button className='selection' onClick={this.show_entire_table.bind(this)}> Show All </button>
            </section>

            <section className='image_section' id='image_section'>
                <img id='curr_img' src={url+'/image'} alt="initial image" />

            </section>
        </>
        );
    }
}

export default Content;
