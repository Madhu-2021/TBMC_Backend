import sys
import os
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel, PeftConfig

def main():
    # Get input from command line
    if len(sys.argv) < 2:
        print("Usage: python run_falcon_model.py 'user input text'")
        return
    
    user_input = sys.argv[1]
    print(f"Processing input: {user_input}")
    
    # Path to your model
    adapter_path = r"C:\Users\venki\Downloads\falcon_lora_model\content\falcon-rw1b-foodassist-lora"
    
    try:
        # Load the base model
        print("Loading base model...")
        base_model_id = "tiiuae/falcon-rw-1b"
        base_model = AutoModelForCausalLM.from_pretrained(base_model_id)
        
        # Load tokenizer directly from the adapter directory
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(adapter_path, trust_remote_code=True)
        
        # Load the adapter configuration
        print("Loading adapter config...")
        adapter_config = PeftConfig.from_pretrained(adapter_path)
        
        # Apply the adapter to the base model
        print("Applying adapter to model...")
        model = PeftModel.from_pretrained(base_model, adapter_path)
        
        # Generate response
        print("Generating response...")
        inputs = tokenizer(user_input, return_tensors="pt")
        with torch.no_grad():
            outputs = model.generate(
                inputs["input_ids"],
                max_length=100,
                do_sample=True,
                temperature=0.7
            )
        
        # Decode and print response
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print("\nResponse:")
        print(response)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()