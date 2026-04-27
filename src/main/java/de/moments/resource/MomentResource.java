package de.moments.resource;

import de.moments.dto.*;
import de.moments.service.MomentService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/moments")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MomentResource {

    @Inject
    MomentService momentService;

    @GET
    public List<MomentResponse> findAll() {
        return momentService.findAll();
    }

    @GET
    @Path("/{id}")
    public MomentResponse findById(@PathParam("id") Long id) {
        return momentService.findById(id);
    }

    @POST
    @Path("/target-date")
    public Response createTargetDate(@Valid CreateTargetDateMomentRequest request) {
        MomentResponse response = momentService.createTargetDate(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @POST
    @Path("/since-date")
    public Response createSinceDate(@Valid CreateSinceDateMomentRequest request) {
        MomentResponse response = momentService.createSinceDate(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    public MomentResponse update(@PathParam("id") Long id, @Valid UpdateMomentRequest request) {
        return momentService.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        momentService.delete(id);
        return Response.noContent().build();
    }
}
