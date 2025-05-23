# import sys
# import os
# import torch
# from transformers import AutoModelForCausalLM, AutoTokenizer
# from peft import PeftModel, PeftConfig

# # Suppress warnings
# import warnings
# warnings.filterwarnings("ignore")

# # Get input from command line
# if len(sys.argv) < 2:
#     print("Usage: python run_query.py 'user question'")
#     sys.exit(1)

# # Add food service context to the input
# original_input = sys.argv[1]
# user_input = f"As a food service assistant, please answer: {original_input}"

# try:
#     # Path to your checkpoint directory
#     checkpoint_path = r"C:\\Users\\venki\\Downloads\\falcon_lora_model\\content\\falcon_rw1b_foodassist_lora\\checkpoint_36"
    
#     if not os.path.exists(checkpoint_path):
#         raise FileNotFoundError(f"Checkpoint path '{checkpoint_path}' does not exist.")
    
#     print(f"Loading model from checkpoint: {checkpoint_path}")
    
#     # Create temp directory for offloading if needed
#     temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_offload")
#     os.makedirs(temp_dir, exist_ok=True)
    
#     # Load tokenizer directly from checkpoint
#     tokenizer = AutoTokenizer.from_pretrained(checkpoint_path)
    
#     # Load base model with memory optimizations (use GPU if available)
#     device = "cuda" if torch.cuda.is_available() else "cpu"
    
#     base_model = AutoModelForCausalLM.from_pretrained(
#         "tiiuae/falcon-rw-1b", 
#         torch_dtype=torch.float16,  # Use half precision
#         low_cpu_mem_usage=True,     # Optimize CPU memory usage
#         offload_folder=temp_dir     # Specify folder for offloading
#     ).to(device)
    
#     # Manually load adapter model from local directory
#     adapter_model_path = os.path.join(checkpoint_path, "adapter_model.safetensors")
#     if os.path.exists(adapter_model_path):
#         adapter_model = torch.load(adapter_model_path, map_location=device)
#         base_model.load_state_dict(adapter_model)
    
#     # Load adapter config
#     config = PeftConfig.from_pretrained(checkpoint_path)
    
#     # Apply adapter to base model
#     model = PeftModel(base_model, config).to(device)
    
#     # Set to evaluation mode for faster inference
#     model.eval()
    
#     # Generate response with optimized settings
#     inputs = tokenizer(user_input, return_tensors="pt").to(device)
    
#     # Create attention mask
#     attention_mask = torch.ones_like(inputs["input_ids"]).to(device)
    
#     # Generate with optimized parameters
#     with torch.no_grad():
#         outputs = model.generate(
#             inputs["input_ids"],
#             attention_mask=attention_mask,
#             max_length=100,          # Reduced for faster generation
#             temperature=0.7,
#             do_sample=True,
#             pad_token_id=tokenizer.eos_token_id,
#             num_beams=1,             # Disable beam search for speed
#             early_stopping=True
#         )
    
#     response = tokenizer.decode(outputs[0], skip_special_tokens=True)
#     print(response)
    
# except Exception as e:
#     print(f"Error processing request: {str(e)}")
#     import traceback
#     traceback.print_exc()
#     sys.exit(1)
# import sys
# import os
# import torch
# from transformers import GPT2Tokenizer, GPT2LMHeadModel

# # Suppress warnings
# import warnings
# warnings.filterwarnings("ignore")

# # Get input from command line
# if len(sys.argv) < 2:
#     print("Usage: python run_query.py 'user question'")
#     sys.exit(1)

# original_input = sys.argv[1]

# try:
#     # Load model and tokenizer
#     model_path = r"C:\Users\venki\Downloads\fine-tuned-model (4)"
    
#     if not os.path.exists(model_path):
#         raise FileNotFoundError(f"Model path '{model_path}' does not exist.")

#     tokenizer = GPT2Tokenizer.from_pretrained(model_path)
#     model = GPT2LMHeadModel.from_pretrained(model_path, torch_dtype=torch.float16).to("cuda" if torch.cuda.is_available() else "cpu")
#     model.eval()

#     # Encode the input
#     inputs = tokenizer(original_input, return_tensors="pt").to(model.device)

#     # Generate the response
#     with torch.no_grad():
#         outputs = model.generate(
#             inputs["input_ids"],
#             max_length=80,
#             temperature=0.7,
#             do_sample=True,
#             top_k=50,
#             top_p=0.95,
#             pad_token_id=tokenizer.eos_token_id,
#             num_beams=1,
#             early_stopping=True
#         )

#     # Decode and clean response
#     decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)

#     # Try extracting the clean response (remove input prompt if present)
#     response = decoded.replace(original_input, "").strip()
#     print(response)

# except Exception as e:
#     print(f"Error: {str(e)}")
#     import traceback
#     traceback.print_exc()
#     sys.exit(1)
import sys
import os
import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel
import warnings
from typing import Optional

# Suppress warnings
warnings.filterwarnings("ignore")

def load_model_and_tokenizer(model_path: str) -> tuple:
    """Load model and tokenizer with error handling"""
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model path '{model_path}' does not exist")
    
    tokenizer = GPT2Tokenizer.from_pretrained(model_path)
    model = GPT2LMHeadModel.from_pretrained(
        model_path,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
    ).to("cuda" if torch.cuda.is_available() else "cpu")
    model.eval()
    return tokenizer, model

def generate_response(
    model, 
    tokenizer, 
    input_text: str, 
    max_length: int = 80,
    temperature: float = 0.7,
    top_k: int = 50,
    top_p: float = 0.95
) -> str:
    """Generate response with optimized parameters"""
    inputs = tokenizer(input_text, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=max_length,
            temperature=temperature,
            do_sample=True,
            top_k=top_k,
            top_p=top_p,
            pad_token_id=tokenizer.eos_token_id,
            num_beams=1,
            early_stopping=True,
            no_repeat_ngram_size=2  # Prevent repetition
        )
    
    # Extract just the generated portion
    output_ids = outputs[0][len(inputs["input_ids"][0]):]
    return tokenizer.decode(output_ids, skip_special_tokens=True).strip()

def get_restaurant_status() -> str:
    """Simulate checking current restaurant availability"""
    # In production, replace with actual API call to your database
    return "Tandoori Flames, Pasta Point, and Curry Express"

def handle_restaurant_availability_query() -> str:
    """Special handling for restaurant availability queries"""
    restaurants = get_restaurant_status()
    return f"The following restaurants are currently open: {restaurants}. Would you like to order from any of these?"

def process_query(input_text: str) -> str:
    """Route queries to appropriate handler"""
    restaurant_keywords = ["restaurant", "available", "open", "which restaurants", "can i order from"]
    
    if any(keyword in input_text.lower() for keyword in restaurant_keywords):
        return handle_restaurant_availability_query()
    
    # Default case - use the language model
    model_path = r"fine-tuned-model (4)"
    tokenizer, model = load_model_and_tokenizer(model_path)
    return generate_response(model, tokenizer, input_text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_query.py 'user question'")
        sys.exit(1)

    try:
        user_input = sys.argv[1]
        response = process_query(user_input)
        print(response)
    except Exception as e:
        print(f"Error processing your request: {str(e)}")
        sys.exit(1)