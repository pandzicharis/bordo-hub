using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using dotnet.Data;
using dotnet.Services;
using dotnet.Models;

namespace dotnet.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var user = HttpContext.Items["User"] as AuthenticatedUser;

            if (user == null)
            {
                return Unauthorized();
            }

            return Ok(user);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            var user = HttpContext.Items["User"] as AuthenticatedUser;

            if (user == null)
            {
                return Unauthorized();
            }


            var users = await _userService.GetAllUsersAsync();

            return Ok(new { users,user});
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            var createdUser = await _userService.CreateUserAsync(user);
            return CreatedAtAction(nameof(GetAllUsers), new { id = createdUser.Id }, createdUser);
        }
    }
}