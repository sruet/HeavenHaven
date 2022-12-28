function Input(props) {
    return (
        <div>
            {props.icon ? <img src={props.icon} alt="Logo" /> : null}
            <input
                name={props.name}
                type={props.type}
                onChange={(event) => props.setInput?.(event.target.value)}
                value={props.value}
                placeholder={props.label}
                onBlur={props.onBlur}
            />
            {props.error ? <p>Champ non valide</p> : null}
        </div>
    );
}

export default Input;
